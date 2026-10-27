/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MiNote } from '@/models/Note.js';

export interface CandidateNote {
	note: MiNote;
	hashtags: string[];
	authorFollowed?: boolean;
	userInteracted?: boolean;
}

export interface RecommendationUserProfile {
	userId: string;
	mutedTopics: string[];
	reducedAuthors: string[];
	preferredTopics: string[];
	topicWeights: Record<string, number>;
	followingUserIds?: Set<string>;
}

export type ExplanationReason =
	| 'explicit_topic'
	| 'inferred_topic'
	| 'followed_author'
	| 'saved_interaction'
	| 'trending_recency';

export interface ScoredRecommendation {
	note: MiNote;
	score: number;
	explanation: string;
	principalReason: ExplanationReason;
	scoreBreakdown: {
		interestScore: number;
		interactionScore: number;
		recencyScore: number;
		diversityPenalty: number;
	};
}

export interface RecommendationRankingStrategy {
	readonly name: string;
	scoreCandidates(
		candidates: CandidateNote[],
		profile: RecommendationUserProfile,
		now?: Date,
	): ScoredRecommendation[];
}

function normalizeTopic(topic: string): string {
	return topic.trim().toLowerCase().replace(/^#/, '');
}

/**
 * Deterministic weighted scoring strategy for For You feed:
 * score = interestRelevance + interactionRelevance + recencyContribution - diversityPenalty
 */
export class WeightedPersonalizedRankingStrategy implements RecommendationRankingStrategy {
	public readonly name = 'weighted-personalized';

	public scoreCandidates(
		candidates: CandidateNote[],
		profile: RecommendationUserProfile,
		now: Date = new Date(),
	): ScoredRecommendation[] {
		const mutedSet = new Set(profile.mutedTopics.map(normalizeTopic));
		const reducedAuthorsSet = new Set(profile.reducedAuthors);
		const preferredSet = new Set(profile.preferredTopics.map(normalizeTopic));

		const normalizedWeights: Record<string, number> = {};
		for (const [t, w] of Object.entries(profile.topicWeights ?? {})) {
			normalizedWeights[normalizeTopic(t)] = w;
		}

		// 1. Initial scoring for each candidate
		interface ScoredInitial {
			candidate: CandidateNote;
			interestScore: number;
			interactionScore: number;
			recencyScore: number;
			authorReductionPenalty: number;
			matchedExplicitTopic?: string;
			matchedInferredTopic?: string;
		}

		const initialList: ScoredInitial[] = [];

		for (const cand of candidates) {
			const note = cand.note;
			const candTopics = cand.hashtags.map(normalizeTopic);

			// Hard mute check: If any topic matches a muted topic, exclude completely!
			if (candTopics.some(t => mutedSet.has(t))) {
				continue;
			}

			// Interest relevance
			let interestScore = 0;
			let matchedExplicitTopic: string | undefined;
			let matchedInferredTopic: string | undefined;

			for (const topic of candTopics) {
				if (preferredSet.has(topic)) {
					interestScore += 40;
					if (!matchedExplicitTopic) matchedExplicitTopic = topic;
				}
				if (normalizedWeights[topic]) {
					const w = normalizedWeights[topic];
					interestScore += Math.min(30, Math.max(0, w * 10));
					if (!matchedInferredTopic) matchedInferredTopic = topic;
				}
			}

			// Interaction relevance
			let interactionScore = 0;
			const isAuthorFollowed = cand.authorFollowed || (profile.followingUserIds?.has(note.userId) ?? false);
			if (isAuthorFollowed) {
				interactionScore += 25;
			}
			if (cand.userInteracted) {
				interactionScore += 15;
			}

			// Recency contribution: exponential decay over 24 hours
			const ageHours = Math.max(0, (now.getTime() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60));
			const recencyScore = 30 * Math.exp(-ageHours / 24);

			// Author reduction policy: strong penalty (-100) if reduced
			const authorReductionPenalty = reducedAuthorsSet.has(note.userId) ? 100 : 0;

			initialList.push({
				candidate: cand,
				interestScore,
				interactionScore,
				recencyScore,
				authorReductionPenalty,
				matchedExplicitTopic,
				matchedInferredTopic,
			});
		}

		// 2. Iterative diversity selection: select top post while adjusting diversity penalties
		const results: ScoredRecommendation[] = [];
		const authorCounts = new Map<string, number>();
		const topicCounts = new Map<string, number>();
		const remaining = [...initialList];

		while (remaining.length > 0) {
			// Compute effective dynamic score with diversity penalties for remaining candidates
			let bestIndex = -1;
			let bestScore = -Infinity;
			let bestBreakdown = { interestScore: 0, interactionScore: 0, recencyScore: 0, diversityPenalty: 0 };
			let bestInitial: ScoredInitial | null = null;

			for (let i = 0; i < remaining.length; i++) {
				const item = remaining[i];
				const note = item.candidate.note;
				const authorCount = authorCounts.get(note.userId) ?? 0;

				let candTopicPenalty = 0;
				for (const t of item.candidate.hashtags.map(normalizeTopic)) {
					candTopicPenalty += (topicCounts.get(t) ?? 0) * 5;
				}

				const diversityPenalty = (authorCount * 20) + candTopicPenalty + item.authorReductionPenalty;
				const currentScore = item.interestScore + item.interactionScore + item.recencyScore - diversityPenalty;

				// Tie-breaking: score > createdAt > id
				let isBetter = false;
				if (bestIndex === -1) {
					isBetter = true;
				} else if (currentScore > bestScore) {
					isBetter = true;
				} else if (Math.abs(currentScore - bestScore) < 1e-6) {
					const curDate = new Date(note.createdAt).getTime();
					const bestDate = new Date(remaining[bestIndex].candidate.note.createdAt).getTime();
					if (curDate > bestDate) {
						isBetter = true;
					} else if (curDate === bestDate && note.id.localeCompare(remaining[bestIndex].candidate.note.id) > 0) {
						isBetter = true;
					}
				}

				if (isBetter) {
					bestIndex = i;
					bestScore = currentScore;
					bestBreakdown = {
						interestScore: item.interestScore,
						interactionScore: item.interactionScore,
						recencyScore: item.recencyScore,
						diversityPenalty,
					};
					bestInitial = item;
				}
			}

			if (bestIndex === -1 || !bestInitial) break;

			const chosen = remaining.splice(bestIndex, 1)[0];
			const chosenNote = chosen.candidate.note;

			// Update diversity counts
			authorCounts.set(chosenNote.userId, (authorCounts.get(chosenNote.userId) ?? 0) + 1);
			for (const t of chosen.candidate.hashtags.map(normalizeTopic)) {
				topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
			}

			// Generate explainable reason
			let explanation = 'Recommended based on recent popular activity';
			let principalReason: ExplanationReason = 'trending_recency';

			if (chosen.matchedExplicitTopic) {
				explanation = `Recommended because you follow #${chosen.matchedExplicitTopic}`;
				principalReason = 'explicit_topic';
			} else if (chosen.matchedInferredTopic && chosen.interestScore > chosen.interactionScore) {
				explanation = `Recommended because you frequently interact with posts about #${chosen.matchedInferredTopic}`;
				principalReason = 'inferred_topic';
			} else if (chosen.candidate.userInteracted) {
				explanation = 'Recommended because you previously interacted with this or similar content';
				principalReason = 'saved_interaction';
			} else if (chosen.candidate.authorFollowed || profile.followingUserIds?.has(chosenNote.userId)) {
				const authorName = (chosenNote as any).user?.username ? `@${(chosenNote as any).user.username}` : 'an author you follow';
				explanation = `Recommended because you follow ${authorName}`;
				principalReason = 'followed_author';
			}

			results.push({
				note: chosenNote,
				score: Number(bestScore.toFixed(4)),
				explanation,
				principalReason,
				scoreBreakdown: bestBreakdown,
			});
		}

		return results;
	}
}

/**
 * Chronological ranking strategy for fallback / opt-out
 */
export class ChronologicalRankingStrategy implements RecommendationRankingStrategy {
	public readonly name = 'chronological';

	public scoreCandidates(
		candidates: CandidateNote[],
		profile: RecommendationUserProfile,
	): ScoredRecommendation[] {
		const mutedSet = new Set(profile.mutedTopics.map(normalizeTopic));

		const filtered = candidates.filter(cand => {
			const candTopics = cand.hashtags.map(normalizeTopic);
			return !candTopics.some(t => mutedSet.has(t));
		});

		// Sort by createdAt desc, tie-break by id desc
		filtered.sort((a, b) => {
			const diff = new Date(b.note.createdAt).getTime() - new Date(a.note.createdAt).getTime();
			if (diff !== 0) return diff;
			return b.note.id.localeCompare(a.note.id);
		});

		return filtered.map(cand => ({
			note: cand.note,
			score: new Date(cand.note.createdAt).getTime(),
			explanation: 'Chronological timeline order',
			principalReason: 'trending_recency',
			scoreBreakdown: {
				interestScore: 0,
				interactionScore: 0,
				recencyScore: 100,
				diversityPenalty: 0,
			},
		}));
	}
}
