/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, beforeEach, test, expect, vi } from 'vitest';
import { RecommendationService, normalizeTopic, extractHashtags } from '@/core/RecommendationService.js';
import {
	WeightedPersonalizedRankingStrategy,
	ChronologicalRankingStrategy,
	type CandidateNote,
	type RecommendationUserProfile,
} from '@/core/recommendation/RecommendationStrategy.js';
import type {
	RecommendationPreferencesRepository,
	NotesRepository,
	UsersRepository,
	FollowingsRepository,
	MutingsRepository,
	BlockingsRepository,
	NoteReactionsRepository,
	NoteFavoritesRepository,
	FlaggedLinksRepository,
	MiNote,
	MiUser,
} from '@/models/_.js';
import { MiRecommendationPreference } from '@/models/RecommendationPreference.js';

describe('RecommendationService (CH04)', () => {
	let service: RecommendationService;
	let prefStore: Map<string, MiRecommendationPreference>;
	let notesStore: MiNote[];
	let followingsStore: { followerId: string; followeeId: string }[];
	let blockingsStore: { blockerId: string; blockeeId: string }[];
	let mutingsStore: { muterId: string; muteeId: string }[];
	let reactionsStore: { userId: string; noteId: string }[];
	let favoritesStore: { userId: string; noteId: string }[];
	let flaggedLinksStore: any[];

	let prefRepoMock: Partial<RecommendationPreferencesRepository>;
	let notesRepoMock: Partial<NotesRepository>;
	let followingsRepoMock: Partial<FollowingsRepository>;
	let blockingsRepoMock: Partial<BlockingsRepository>;
	let mutingsRepoMock: Partial<MutingsRepository>;
	let reactionsRepoMock: Partial<NoteReactionsRepository>;
	let favoritesRepoMock: Partial<NoteFavoritesRepository>;
	let flaggedRepoMock: Partial<FlaggedLinksRepository>;

	function createMockNote(id: string, authorId: string, tags: string[], text: string, createdAt: Date, visibility = 'public'): MiNote {
		return {
			id,
			userId: authorId,
			visibility,
			localOnly: false,
			text,
			tags,
			createdAt,
			updatedAt: createdAt,
			user: {
				id: authorId,
				username: `user_${authorId}`,
				isDeleted: false,
				isSuspended: false,
			} as MiUser,
		} as unknown as MiNote;
	}

	beforeEach(() => {
		prefStore = new Map();
		notesStore = [];
		followingsStore = [];
		blockingsStore = [];
		mutingsStore = [];
		reactionsStore = [];
		favoritesStore = [];
		flaggedLinksStore = [];

		prefRepoMock = {
			findOneBy: vi.fn(async (query: any) => prefStore.get(query.userId) ?? null),
			save: vi.fn(async (entity: any) => {
				prefStore.set(entity.userId, { ...entity });
				return entity;
			}),
		};

		notesRepoMock = {
			createQueryBuilder: vi.fn(() => {
				const query: any = {
					leftJoinAndSelect: vi.fn().mockReturnThis(),
					where: vi.fn().mockReturnThis(),
					andWhere: vi.fn().mockReturnThis(),
					orderBy: vi.fn().mockReturnThis(),
					take: vi.fn().mockReturnThis(),
					getMany: vi.fn(async () => [...notesStore]),
				};
				return query;
			}),
		};

		followingsRepoMock = {
			findBy: vi.fn(async (query: any) => {
				return followingsStore.filter(f => f.followerId === query.followerId);
			}),
		};

		blockingsRepoMock = {
			findBy: vi.fn(async (query: any) => {
				if (query.blockerId) return blockingsStore.filter(b => b.blockerId === query.blockerId);
				if (query.blockeeId) return blockingsStore.filter(b => b.blockeeId === query.blockeeId);
				return [];
			}),
		};

		mutingsRepoMock = {
			findBy: vi.fn(async (query: any) => {
				return mutingsStore.filter(m => m.muterId === query.muterId);
			}),
		};

		reactionsRepoMock = {
			find: vi.fn(async (query: any) => {
				const noteIds = query?.where?.noteId?._value ?? [];
				return reactionsStore.filter(r => r.userId === query.where.userId && (noteIds.length === 0 || noteIds.includes(r.noteId)));
			}),
		};

		favoritesRepoMock = {
			find: vi.fn(async (query: any) => {
				const noteIds = query?.where?.noteId?._value ?? [];
				return favoritesStore.filter(f => f.userId === query.where.userId && (noteIds.length === 0 || noteIds.includes(f.noteId)));
			}),
		};

		flaggedRepoMock = {
			find: vi.fn(async (query: any) => {
				return flaggedLinksStore.filter(f => !f.resolved && f.riskCategory === 'malicious');
			}),
		};

		service = new RecommendationService(
			prefRepoMock as any,
			notesRepoMock as any,
			undefined,
			followingsRepoMock as any,
			mutingsRepoMock as any,
			blockingsRepoMock as any,
			reactionsRepoMock as any,
			favoritesRepoMock as any,
			flaggedRepoMock as any,
		);
	});

	describe('15.1 Ranking algorithm & strategies', () => {
		test('outranks unrelated post when post matches explicit preferred topic', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');
			const noteA = createMockNote('note_a', 'author1', ['typescript'], 'Learning #typescript', now);
			const noteB = createMockNote('note_b', 'author2', ['gardening'], 'Spring #gardening', now);

			const candidates: CandidateNote[] = [
				{ note: noteB, hashtags: ['gardening'] },
				{ note: noteA, hashtags: ['typescript'] },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: ['typescript'],
				mutedTopics: [],
				reducedAuthors: [],
				topicWeights: {},
			};

			const ranked = strategy.scoreCandidates(candidates, profile, now);
			expect(ranked).toHaveLength(2);
			expect(ranked[0].note.id).toBe('note_a');
			expect(ranked[0].principalReason).toBe('explicit_topic');
			expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
		});

		test('inferred topic weight boosts ranking proportionally', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');
			const noteA = createMockNote('note_a', 'author1', ['tech'], 'Post on #tech', now);
			const noteB = createMockNote('note_b', 'author2', ['general'], 'General post', now);

			const candidates: CandidateNote[] = [
				{ note: noteB, hashtags: ['general'] },
				{ note: noteA, hashtags: ['tech'] },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: [],
				mutedTopics: [],
				reducedAuthors: [],
				topicWeights: { tech: 2.5 },
			};

			const ranked = strategy.scoreCandidates(candidates, profile, now);
			expect(ranked[0].note.id).toBe('note_a');
			expect(ranked[0].principalReason).toBe('inferred_topic');
			expect(ranked[0].scoreBreakdown.interestScore).toBeGreaterThan(0);
		});

		test('followed author and past interactions provide meaningful relevance boost', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');
			const noteFollowed = createMockNote('note_f', 'author_f', [], 'From friend', now);
			const noteStranger = createMockNote('note_s', 'author_s', [], 'From stranger', now);

			const candidates: CandidateNote[] = [
				{ note: noteStranger, hashtags: [], authorFollowed: false },
				{ note: noteFollowed, hashtags: [], authorFollowed: true, userInteracted: true },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: [],
				mutedTopics: [],
				reducedAuthors: [],
				topicWeights: {},
			};

			const ranked = strategy.scoreCandidates(candidates, profile, now);
			expect(ranked[0].note.id).toBe('note_f');
			expect(ranked[0].scoreBreakdown.interactionScore).toBe(40); // 25 (followed) + 15 (interacted)
		});

		test('recency decay gives advantage to newer posts with comparable relevance', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');
			const recentDate = new Date('2026-10-11T11:30:00Z'); // 30 mins ago
			const oldDate = new Date('2026-10-09T12:00:00Z'); // 48 hours ago

			const noteRecent = createMockNote('note_rec', 'a1', ['topic'], 'Fresh note', recentDate);
			const noteOld = createMockNote('note_old', 'a2', ['topic'], 'Old note', oldDate);

			const candidates: CandidateNote[] = [
				{ note: noteOld, hashtags: ['topic'] },
				{ note: noteRecent, hashtags: ['topic'] },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: ['topic'],
				mutedTopics: [],
				reducedAuthors: [],
				topicWeights: {},
			};

			const ranked = strategy.scoreCandidates(candidates, profile, now);
			expect(ranked[0].note.id).toBe('note_rec');
			expect(ranked[0].scoreBreakdown.recencyScore).toBeGreaterThan(ranked[1].scoreBreakdown.recencyScore);
		});

		test('author diversity penalty suppresses consecutive posts from the same author', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');

			const noteA1 = createMockNote('note_a1', 'prolific_author', ['news'], 'Article 1', now);
			const noteA2 = createMockNote('note_a2', 'prolific_author', ['news'], 'Article 2', new Date(now.getTime() - 1000));
			const noteB1 = createMockNote('note_b1', 'other_author', ['news'], 'Article 3', new Date(now.getTime() - 2000));

			const candidates: CandidateNote[] = [
				{ note: noteA1, hashtags: ['news'] },
				{ note: noteA2, hashtags: ['news'] },
				{ note: noteB1, hashtags: ['news'] },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: ['news'],
				mutedTopics: [],
				reducedAuthors: [],
				topicWeights: {},
			};

			const ranked = strategy.scoreCandidates(candidates, profile, now);
			expect(ranked[0].note.id).toBe('note_a1');
			// Due to diversity penalty on prolific_author, other_author moves ahead of noteA2
			expect(ranked[1].note.id).toBe('note_b1');
			expect(ranked[2].note.id).toBe('note_a2');
		});

		test('reduced-recommendation author receives heavy suppression penalty', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');

			const noteNormal = createMockNote('note_norm', 'normal_user', ['tech'], 'Normal tech post', now);
			const noteReduced = createMockNote('note_red', 'reduced_user', ['tech'], 'Reduced author post', now);

			const candidates: CandidateNote[] = [
				{ note: noteReduced, hashtags: ['tech'] },
				{ note: noteNormal, hashtags: ['tech'] },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: ['tech'],
				mutedTopics: [],
				reducedAuthors: ['reduced_user'],
				topicWeights: {},
			};

			const ranked = strategy.scoreCandidates(candidates, profile, now);
			expect(ranked[0].note.id).toBe('note_norm');
			expect(ranked[1].note.id).toBe('note_red');
			expect(ranked[1].scoreBreakdown.diversityPenalty).toBeGreaterThanOrEqual(100);
		});

		test('deterministic tie-breaking produces identical repeatable ordering', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const now = new Date('2026-10-11T12:00:00Z');

			const note1 = createMockNote('note_1', 'author1', [], 'Post 1', now);
			const note2 = createMockNote('note_2', 'author2', [], 'Post 2', now);

			const candidates: CandidateNote[] = [
				{ note: note1, hashtags: [] },
				{ note: note2, hashtags: [] },
			];

			const profile: RecommendationUserProfile = {
				userId: 'user1',
				preferredTopics: [],
				mutedTopics: [],
				reducedAuthors: [],
				topicWeights: {},
			};

			const run1 = strategy.scoreCandidates(candidates, profile, now);
			const run2 = strategy.scoreCandidates(candidates, profile, now);

			expect(run1.map(r => r.note.id)).toEqual(run2.map(r => r.note.id));
			expect(run1.map(r => r.score)).toEqual(run2.map(r => r.score));
		});
	});

	describe('15.2 Truthful and explainable recommendations', () => {
		test('emits explicit topic explanation when matched', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const note = createMockNote('n1', 'a1', ['opensource'], '#opensource rocks', new Date());
			const ranked = strategy.scoreCandidates(
				[{ note, hashtags: ['opensource'] }],
				{ userId: 'u1', preferredTopics: ['opensource'], mutedTopics: [], reducedAuthors: [], topicWeights: {} },
			);

			expect(ranked[0].explanation).toBe('Recommended because you follow #opensource');
			expect(ranked[0].principalReason).toBe('explicit_topic');
		});

		test('emits inferred interaction explanation when topic weight is highest signal', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const note = createMockNote('n1', 'a1', ['linux'], 'Kernel notes #linux', new Date());
			const ranked = strategy.scoreCandidates(
				[{ note, hashtags: ['linux'] }],
				{ userId: 'u1', preferredTopics: [], mutedTopics: [], reducedAuthors: [], topicWeights: { linux: 3.0 } },
			);

			expect(ranked[0].explanation).toBe('Recommended because you frequently interact with posts about #linux');
			expect(ranked[0].principalReason).toBe('inferred_topic');
		});

		test('emits followed author explanation when author is followed', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const note = createMockNote('n1', 'friend_1', [], 'Hello world', new Date());
			const ranked = strategy.scoreCandidates(
				[{ note, hashtags: [], authorFollowed: true }],
				{ userId: 'u1', preferredTopics: [], mutedTopics: [], reducedAuthors: [], topicWeights: {}, followingUserIds: new Set(['friend_1']) },
			);

			expect(ranked[0].explanation).toContain('Recommended because you follow @user_friend_1');
			expect(ranked[0].principalReason).toBe('followed_author');
		});

		test('truthful fallback explanation when no user preference matches', () => {
			const strategy = new WeightedPersonalizedRankingStrategy();
			const note = createMockNote('n1', 'stranger', [], 'Public status', new Date());
			const ranked = strategy.scoreCandidates(
				[{ note, hashtags: [] }],
				{ userId: 'u1', preferredTopics: [], mutedTopics: [], reducedAuthors: [], topicWeights: {} },
			);

			expect(ranked[0].explanation).toBe('Recommended based on recent popular activity');
			expect(ranked[0].principalReason).toBe('trending_recency');
		});
	});

	describe('15.3 User controls and preference persistence', () => {
		test('topic mute completely excludes matching candidate notes', async () => {
			const now = new Date();
			notesStore = [
				createMockNote('n_sports', 'a1', ['sports'], 'Game highlights #sports', now),
				createMockNote('n_coding', 'a2', ['coding'], 'Code review #coding', now),
			];

			await service.updatePreferences('user1', { mutedTopics: ['#Sports'] });

			const recs = await service.getRecommendations('user1', { now });
			expect(recs.map(r => r.note.id)).not.toContain('n_sports');
			expect(recs.map(r => r.note.id)).toContain('n_coding');
		});

		test('profile reset clears recommendation state without touching user data', async () => {
			await service.updatePreferences('user1', {
				preferredTopics: ['ai', 'rust'],
				mutedTopics: ['crypto'],
				reducedAuthors: ['spammer'],
				topicWeights: { ai: 5 },
			});

			let pref = await service.getPreferences('user1');
			expect(pref.preferredTopics).toHaveLength(2);
			expect(pref.mutedTopics).toHaveLength(1);

			await service.resetProfile('user1');
			pref = await service.getPreferences('user1');

			expect(pref.preferredTopics).toEqual([]);
			expect(pref.mutedTopics).toEqual([]);
			expect(pref.reducedAuthors).toEqual([]);
			expect(pref.topicWeights).toEqual({});
		});

		test('topic normalization strips hashes and ignores casing', () => {
			expect(normalizeTopic('  #OpenSource  ')).toBe('opensource');
			expect(normalizeTopic('#RustLang')).toBe('rustlang');
			expect(normalizeTopic('Typescript')).toBe('typescript');

			const note = createMockNote('n1', 'a1', ['JavaScript', 'web'], 'Learning #React and #CSS', new Date());
			const tags = extractHashtags(note);
			expect(tags).toContain('javascript');
			expect(tags).toContain('web');
			expect(tags).toContain('react');
			expect(tags).toContain('css');
		});
	});

	describe('15.4 Visibility, privacy and content safety', () => {
		test('non-public notes (home, followers, specified) are strictly excluded', async () => {
			const now = new Date();
			notesStore = [
				createMockNote('n_pub', 'a1', [], 'Public note', now, 'public'),
				createMockNote('n_home', 'a2', [], 'Home note', now, 'home'),
				createMockNote('n_followers', 'a3', [], 'Followers note', now, 'followers'),
				createMockNote('n_specified', 'a4', [], 'DM note', now, 'specified'),
			];

			const recs = await service.getRecommendations('user1', { now });
			const ids = recs.map(r => r.note.id);
			expect(ids).toContain('n_pub');
			expect(ids).not.toContain('n_home');
			expect(ids).not.toContain('n_followers');
			expect(ids).not.toContain('n_specified');
		});

		test('blocked or muting users are excluded from recommendations', async () => {
			const now = new Date();
			notesStore = [
				createMockNote('n1', 'author_blocked', [], 'Post by blocked', now),
				createMockNote('n2', 'author_muted', [], 'Post by muted', now),
				createMockNote('n3', 'author_ok', [], 'Post by ok', now),
			];

			blockingsStore.push({ blockerId: 'user1', blockeeId: 'author_blocked' });
			mutingsStore.push({ muterId: 'user1', muteeId: 'author_muted' });

			const recs = await service.getRecommendations('user1', { now });
			const ids = recs.map(r => r.note.id);
			expect(ids).not.toContain('n1');
			expect(ids).not.toContain('n2');
			expect(ids).toContain('n3');
		});

		test('CH03 malicious links are strictly excluded from recommendation feed', async () => {
			const now = new Date();
			notesStore = [
				createMockNote('n_safe', 'a1', [], 'Safe post with https://example.com', now),
				createMockNote('n_malicious', 'a2', [], 'Phishing link here', now),
			];

			flaggedLinksStore.push({
				id: 'fl_1',
				noteId: 'n_malicious',
				riskCategory: 'malicious',
				resolved: false,
			});

			const recs = await service.getRecommendations('user1', { now });
			const ids = recs.map(r => r.note.id);
			expect(ids).toContain('n_safe');
			expect(ids).not.toContain('n_malicious');
		});
	});

	describe('15.5 Chronological mode and pagination', () => {
		test('chronological mode orders strictly by createdAt descending with correct explanation', async () => {
			const t1 = new Date('2026-10-11T10:00:00Z');
			const t2 = new Date('2026-10-11T11:00:00Z');
			const t3 = new Date('2026-10-11T09:00:00Z');

			notesStore = [
				createMockNote('n1', 'a1', [], 'Post 1', t1),
				createMockNote('n2', 'a2', [], 'Post 2', t2),
				createMockNote('n3', 'a3', [], 'Post 3', t3),
			];

			const recs = await service.getRecommendations('user1', { mode: 'chronological' });
			expect(recs.map(r => r.note.id)).toEqual(['n2', 'n1', 'n3']);
			expect(recs[0].explanation).toBe('Chronological timeline order');
		});

		test('pagination respects limit and slices results cleanly', async () => {
			const now = new Date();
			notesStore = [
				createMockNote('n1', 'a1', [], 'Post 1', new Date(now.getTime() - 1000)),
				createMockNote('n2', 'a2', [], 'Post 2', new Date(now.getTime() - 2000)),
				createMockNote('n3', 'a3', [], 'Post 3', new Date(now.getTime() - 3000)),
			];

			const page1 = await service.getRecommendations('user1', { limit: 2, now });
			expect(page1).toHaveLength(2);

			const page2 = await service.getRecommendations('user1', { limit: 2, untilId: page1[1].note.id, now });
			expect(page2).toHaveLength(1);
			expect(page2[0].note.id).toBe('n3');
		});
	});

	describe('15.6 Cache isolation and invalidation', () => {
		test('cache is isolated per user and invalidated on preference update', async () => {
			const now = new Date();
			notesStore = [
				createMockNote('n1', 'a1', ['crypto'], 'Crypto post', now),
				createMockNote('n2', 'a2', ['foss'], 'Open source post', now),
			];

			const recsUser1 = await service.getRecommendations('user1', { now });
			expect(recsUser1).toHaveLength(2);

			// User 1 mutes crypto -> cache invalidated for user 1
			await service.updatePreferences('user1', { mutedTopics: ['crypto'] });

			const freshRecs = await service.getRecommendations('user1', { now });
			expect(freshRecs.map(r => r.note.id)).toEqual(['n2']);

			// User 2 is independent and sees crypto
			const recsUser2 = await service.getRecommendations('user2', { now });
			expect(recsUser2.map(r => r.note.id)).toContain('n1');
		});
	});
});
