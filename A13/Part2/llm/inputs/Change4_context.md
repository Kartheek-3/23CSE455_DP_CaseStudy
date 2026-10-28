# Change 4 (CH04) Input Context Report

## 1. Preceding Source Commit and Baseline
- **Original Baseline SHA**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Preceding Verified Commit SHA**: `39e3c987488d59045cc3ed5cfe532f6f32c0936d` (Change 3 - Context-Aware Link Safety and Spam Protection)
- **Branch**: `develop`
- **Working Tree State**: Clean working tree before CH04 implementation
- **Environment**: Node.js `v22.23.1`, pnpm `11.25.0`, Fedora Linux 44 Workstation, Git `2.51.0`

---

## 2. Source Files Inspected Prior to Implementation
1. **Existing Timeline & Feed Architecture**:
   - `packages/backend/src/server/api/endpoints/notes/timeline.ts`: Investigated timeline note fetching, DB fallback, fanout timelines, pagination params (`sinceId`, `untilId`, `limit`).
   - `packages/backend/src/server/api/endpoints/notes/hybrid-timeline.ts`: Traced query builder and parameter handling for social timelines.
   - `packages/backend/src/core/entities/NoteEntityService.ts`: Traced `packMany(notes, me)` entity packing for client responses.
2. **Post Filtering, Privacy & Moderation**:
   - `packages/backend/src/models/Note.ts`: Inspected note fields (`tags`, `visibility`, `localOnly`, `text`, `cw`, `userId`).
   - `packages/backend/src/models/Following.ts`, `Muting.ts`, `Blocking.ts`: Relation models between users.
   - `packages/backend/src/models/FlaggedLink.ts`: CH03 flagged links table for malicious link exclusion.
3. **Dependency Injection & Registration**:
   - `packages/backend/src/di-symbols.ts`: DI token registry for repositories.
   - `packages/backend/src/models/RepositoryModule.ts`: TypeORM provider factories.
   - `packages/backend/src/core/CoreModule.ts`: Core service providers and exports.
   - `packages/backend/src/server/api/endpoint-list.ts`: Central endpoint registry.
4. **Frontend Integration**:
   - `packages/frontend/src/components/MkNote.vue`: Note rendering template and styles. Added `recommendationTip` banner.
   - `packages/frontend/src/pages/favorites.vue`, `clip.vue`: Paginator and timeline page structures.

---

## 3. Architectural & Design Decisions
1. **Opt-in and Timeline Separation**:
   - Recommendation feed is completely separate from existing chronological timelines. Home, Local, Social, and Global timelines remain unaffected.
   - Dedicated route `/for-you` and endpoint `recommendations/for-you` provide an opt-in experience with mode toggle (Personalized vs. Chronological).
2. **Deterministic Strategy Pattern**:
   - Implemented `RecommendationRankingStrategy` interface with `WeightedPersonalizedRankingStrategy` and `ChronologicalRankingStrategy`.
   - Scoring formula: $\text{score} = \text{interestRelevance} + \text{interactionRelevance} + \text{recencyScore} - \text{diversityPenalty}$.
   - Diversity adjustment applies progressive penalties to repeated authors ($-20 \times \text{seen}$) and repeated topics ($-5 \times \text{seen}$).
   - Deterministic tie-breaker: `score DESC`, `createdAt DESC`, `id DESC`.
3. **Truthful Explanations**:
   - Explanations are derived directly from the highest scoring component: explicit topic (`#topic`), inferred topic interaction, followed author, or recent popular activity.
4. **Hard Security & Moderation Invariants**:
   - Strictly public notes only (`visibility === 'public'`).
   - Hard exclusion of blocked/muted authors, deleted/suspended users, muted topics, and CH03 malicious links.
   - Profile reset only clears recommendation state without touching user posts, bookmarks, reactions, or follows.
