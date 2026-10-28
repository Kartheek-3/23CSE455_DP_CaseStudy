/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import { In } from 'typeorm';
import { DI } from '@/di-symbols.js';
import type {
	NotesRepository,
	UsersRepository,
	FollowingsRepository,
	MutingsRepository,
	BlockingsRepository,
	NoteReactionsRepository,
	NoteFavoritesRepository,
	FlaggedLinksRepository,
	RecommendationPreferencesRepository,
	MiNote,
	MiUser,
} from '@/models/_.js';
import { MiRecommendationPreference } from '@/models/RecommendationPreference.js';
import { IdService } from '@/core/IdService.js';
import {
	RecommendationRankingStrategy,
	WeightedPersonalizedRankingStrategy,
	ChronologicalRankingStrategy,
	CandidateNote,
	RecommendationUserProfile,
	ScoredRecommendation,
} from './recommendation/RecommendationStrategy.js';

export interface GetRecommendationsOptions {
	limit?: number;
	mode?: 'personalized' | 'chronological';
	sinceId?: string;
	untilId?: string;
	now?: Date;
}

export function normalizeTopic(topic: string): string {
	return topic.trim().toLowerCase().replace(/^#/, '');
}

export function extractHashtags(note: MiNote): string[] {
	const set = new Set<string>();
	if (Array.isArray(note.tags)) {
		for (const tag of note.tags) {
			if (typeof tag === 'string' && tag.trim()) {
				set.add(normalizeTopic(tag));
			}
		}
	}
	if (note.text) {
		const matches = note.text.matchAll(/(?:^|\s)#([^\s#]+)/g);
		for (const m of matches) {
			if (m[1] && m[1].trim()) {
				set.add(normalizeTopic(m[1]));
			}
		}
	}
	return Array.from(set);
}

@Injectable()
export class RecommendationService {
	private personalizedStrategy: RecommendationRankingStrategy;
	private chronologicalStrategy: RecommendationRankingStrategy;
	private cache = new Map<string, { timestamp: number; results: ScoredRecommendation[] }>();
	private readonly CACHE_TTL_MS = 30000;

	constructor(
		@Optional() @Inject(DI.recommendationPreferencesRepository)
		private recommendationPreferencesRepository?: RecommendationPreferencesRepository,
		@Optional() @Inject(DI.notesRepository)
		private notesRepository?: NotesRepository,
		@Optional() @Inject(DI.usersRepository)
		private usersRepository?: UsersRepository,
		@Optional() @Inject(DI.followingsRepository)
		private followingsRepository?: FollowingsRepository,
		@Optional() @Inject(DI.mutingsRepository)
		private mutingsRepository?: MutingsRepository,
		@Optional() @Inject(DI.blockingsRepository)
		private blockingsRepository?: BlockingsRepository,
		@Optional() @Inject(DI.noteReactionsRepository)
		private noteReactionsRepository?: NoteReactionsRepository,
		@Optional() @Inject(DI.noteFavoritesRepository)
		private noteFavoritesRepository?: NoteFavoritesRepository,
		@Optional() @Inject(DI.flaggedLinksRepository)
		private flaggedLinksRepository?: FlaggedLinksRepository,
		@Optional()
		private idService?: IdService,
	) {
		this.personalizedStrategy = new WeightedPersonalizedRankingStrategy();
		this.chronologicalStrategy = new ChronologicalRankingStrategy();
	}

	public setPersonalizedStrategy(strategy: RecommendationRankingStrategy): void {
		this.personalizedStrategy = strategy;
	}

	public clearUserCache(userId: string): void {
		for (const key of Array.from(this.cache.keys())) {
			if (key.startsWith(`${userId}:`)) {
				this.cache.delete(key);
			}
		}
	}

	public clearAllCache(): void {
		this.cache.clear();
	}

	public async getPreferences(userId: string): Promise<MiRecommendationPreference> {
		if (!this.recommendationPreferencesRepository) {
			return {
				userId,
				mutedTopics: [],
				reducedAuthors: [],
				preferredTopics: [],
				topicWeights: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			} as MiRecommendationPreference;
		}

		let pref = await this.recommendationPreferencesRepository.findOneBy({ userId });
		if (!pref) {
			pref = {
				userId,
				mutedTopics: [],
				reducedAuthors: [],
				preferredTopics: [],
				topicWeights: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			} as MiRecommendationPreference;
			await this.recommendationPreferencesRepository.save(pref);
		}
		return pref;
	}

	public async updatePreferences(
		userId: string,
		update: {
			mutedTopics?: string[];
			reducedAuthors?: string[];
			preferredTopics?: string[];
			topicWeights?: Record<string, number>;
		},
	): Promise<MiRecommendationPreference> {
		const pref = await this.getPreferences(userId);

		if (update.mutedTopics !== undefined) {
			pref.mutedTopics = Array.from(new Set(update.mutedTopics.map(normalizeTopic).filter(Boolean)));
		}
		if (update.reducedAuthors !== undefined) {
			pref.reducedAuthors = Array.from(new Set(update.reducedAuthors.filter(Boolean)));
		}
		if (update.preferredTopics !== undefined) {
			pref.preferredTopics = Array.from(new Set(update.preferredTopics.map(normalizeTopic).filter(Boolean)));
		}
		if (update.topicWeights !== undefined) {
			const cleanedWeights: Record<string, number> = {};
			for (const [k, v] of Object.entries(update.topicWeights)) {
				const norm = normalizeTopic(k);
				if (norm && typeof v === 'number' && !isNaN(v)) {
					cleanedWeights[norm] = v;
				}
			}
			pref.topicWeights = cleanedWeights;
		}
		pref.updatedAt = new Date();

		if (this.recommendationPreferencesRepository) {
			await this.recommendationPreferencesRepository.save(pref);
		}

		this.clearUserCache(userId);
		return pref;
	}

	public async resetProfile(userId: string): Promise<MiRecommendationPreference> {
		const pref = await this.getPreferences(userId);
		pref.mutedTopics = [];
		pref.reducedAuthors = [];
		pref.preferredTopics = [];
		pref.topicWeights = {};
		pref.updatedAt = new Date();

		if (this.recommendationPreferencesRepository) {
			await this.recommendationPreferencesRepository.save(pref);
		}

		this.clearUserCache(userId);
		return pref;
	}

	public async getRecommendations(
		userId: string,
		options: GetRecommendationsOptions = {},
	): Promise<ScoredRecommendation[]> {
		const limit = Math.min(100, Math.max(1, options.limit ?? 10));
		const mode = options.mode ?? 'personalized';
		const now = options.now ?? new Date();

		// Check user-scoped cache
		const cacheKey = `${userId}:${mode}`;
		const cached = this.cache.get(cacheKey);
		if (cached && (now.getTime() - cached.timestamp < this.CACHE_TTL_MS)) {
			return this.paginateRecommendations(cached.results, limit, options.sinceId, options.untilId);
		}

		const pref = await this.getPreferences(userId);

		// 1. Load relation sets for safety and eligibility filtering
		const blockedUserIds = new Set<string>();
		const blockingUserIds = new Set<string>();
		const mutedUserIds = new Set<string>();
		const followingUserIds = new Set<string>();

		if (this.blockingsRepository) {
			const blocks = await this.blockingsRepository.findBy({ blockerId: userId });
			for (const b of blocks) blockedUserIds.add(b.blockeeId);
			const blockedBy = await this.blockingsRepository.findBy({ blockeeId: userId });
			for (const b of blockedBy) blockingUserIds.add(b.blockerId);
		}

		if (this.mutingsRepository) {
			const mutes = await this.mutingsRepository.findBy({ muterId: userId });
			for (const m of mutes) mutedUserIds.add(m.muteeId);
		}

		if (this.followingsRepository) {
			const followings = await this.followingsRepository.findBy({ followerId: userId });
			for (const f of followings) followingUserIds.add(f.followeeId);
		}

		// 2. Query bounded candidate notes: only eligible public notes
		let rawNotes: MiNote[] = [];
		if (this.notesRepository) {
			const qb = this.notesRepository.createQueryBuilder('note')
				.leftJoinAndSelect('note.user', 'user')
				.where('note.visibility = :visibility', { visibility: 'public' })
				.andWhere('note.localOnly = false')
				.orderBy('note.createdAt', 'DESC')
				.take(100);

			rawNotes = await qb.getMany();
		}

		// 3. Filter hard exclusions: blocks, mutes, inactive authors, muted topics, CH03 malicious links
		const candidateNotes: CandidateNote[] = [];
		const mutedTopicSet = new Set(pref.mutedTopics.map(normalizeTopic));

		// Check CH03 malicious links for candidate notes
		const noteIds = rawNotes.map(n => n.id);
		const maliciousNoteIds = new Set<string>();
		if (this.flaggedLinksRepository && noteIds.length > 0) {
			const flagged = await this.flaggedLinksRepository.find({
				where: {
					noteId: In(noteIds),
					resolved: false,
					riskCategory: 'malicious',
				},
			});
			for (const f of flagged) {
				if (f.noteId) maliciousNoteIds.add(f.noteId);
			}
		}

		for (const note of rawNotes) {
			// Inaccessible visibility check (must be public)
			if (note.visibility !== 'public') continue;

			// Author eligibility checks
			if (blockedUserIds.has(note.userId) || blockingUserIds.has(note.userId)) continue;
			if (mutedUserIds.has(note.userId)) continue;
			if (note.user && (note.user.isDeleted || (note.user as any).isSuspended)) continue;

			// CH03 malicious link exclusion
			if (maliciousNoteIds.has(note.id)) continue;

			// Extract hashtags
			const hashtags = extractHashtags(note);

			// Exclude if any hashtag matches muted topics
			if (hashtags.some(t => mutedTopicSet.has(t))) continue;

			candidateNotes.push({
				note,
				hashtags,
				authorFollowed: followingUserIds.has(note.userId),
				userInteracted: false,
			});
		}

		// 4. Mark user interactions (reactions/favorites)
		if (candidateNotes.length > 0) {
			const cNoteIds = candidateNotes.map(c => c.note.id);
			const interactedIds = new Set<string>();

			if (this.noteReactionsRepository) {
				const reactions = await this.noteReactionsRepository.find({
					where: { userId, noteId: In(cNoteIds) },
				});
				for (const r of reactions) interactedIds.add(r.noteId);
			}

			if (this.noteFavoritesRepository) {
				const favs = await this.noteFavoritesRepository.find({
					where: { userId, noteId: In(cNoteIds) },
				});
				for (const f of favs) interactedIds.add(f.noteId);
			}

			for (const cand of candidateNotes) {
				if (interactedIds.has(cand.note.id)) {
					cand.userInteracted = true;
				}
			}
		}

		// 5. Select ranking strategy
		const strategy = mode === 'chronological' ? this.chronologicalStrategy : this.personalizedStrategy;

		const userProfile: RecommendationUserProfile = {
			userId,
			mutedTopics: pref.mutedTopics,
			reducedAuthors: pref.reducedAuthors,
			preferredTopics: pref.preferredTopics,
			topicWeights: pref.topicWeights,
			followingUserIds,
		};

		// 6. Score and rank candidates
		const scored = strategy.scoreCandidates(candidateNotes, userProfile, now);

		// Store in cache
		this.cache.set(cacheKey, { timestamp: now.getTime(), results: scored });

		// 7. Paginate
		return this.paginateRecommendations(scored, limit, options.sinceId, options.untilId);
	}

	private paginateRecommendations(
		list: ScoredRecommendation[],
		limit: number,
		sinceId?: string,
		untilId?: string,
	): ScoredRecommendation[] {
		let result = [...list];

		if (untilId) {
			const index = result.findIndex(r => r.note.id === untilId);
			if (index !== -1) {
				result = result.slice(index + 1);
			}
		}

		if (sinceId) {
			const index = result.findIndex(r => r.note.id === sinceId);
			if (index !== -1) {
				result = result.slice(0, index);
			}
		}

		return result.slice(0, limit);
	}
}
