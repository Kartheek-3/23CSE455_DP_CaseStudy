# Change 4 (CH04) Requirement Document: Explainable, User-Controlled Personalized Feed in Misskey

## 1. Feature Objective
Implement a separate, opt-in **For You** recommendation feed in the Misskey application that ranks eligible public posts according to a user's explicit interests and relevant interactions using a transparent, deterministic algorithm with understandable explanations and granular user controls.

The personalized feed operates as an additional, opt-in timeline alongside Misskey's existing chronological timelines (Home, Local, Social, Global) rather than replacing or silently reordering them.

The feature comprises:
- **Separate Recommendation API & Endpoints**: Dedicated endpoints (`recommendations/for-you`, `recommendations/preferences`, `recommendations/preferences/update`, `recommendations/preferences/reset`) handling recommendation requests, preference management, and profile resets.
- **Deterministic Weighted Ranking Strategy**: Strategy pattern implementation (`WeightedPersonalizedRankingStrategy`, `ChronologicalRankingStrategy`) computing scores based on interest relevance, interaction relevance, recency decay, and diversity adjustments.
- **Explainable Recommendations**: Every recommended post carries an understandable explanation identifying the principal reason for the recommendation (e.g. `"Recommended because you follow #opensource"`, `"Recommended because you follow @user"`, `"Recommended because you frequently interact with posts about #tech"`).
- **User-Controlled Personalization**: Granular user controls allowing users to:
  - Select preferred topics and hashtags.
  - Mute specific topics/hashtags with complete exclusion.
  - Reduce recommendations from specific authors.
  - Reset recommendation profiles without deleting unrelated account data (notes, bookmarks, follows, reactions).
- **Strict Privacy & Safety Enforcement**: Hard constraints excluding non-public notes (`home`, `followers`, `specified`), blocked/muted authors, deleted/suspended accounts, and CH03 flagged malicious links before ranking.
- **Opt-in Frontend Timeline Integration**: A dedicated `/for-you` route with mode switching (Personalized vs Chronological), recommendation reason banners on `MkNote.vue`, and interactive controls modal.

---

## 2. Observable Acceptance Criteria

1. **Opt-in and Timeline Separation**:
   - The For You feed is accessed via a dedicated route (`/for-you`) and dedicated API endpoint (`recommendations/for-you`).
   - Chronological timelines (Home, Local, Social) retain their existing ordering and behavior unmodified.
   - Users can seamlessly switch between Personalized and Chronological modes in the For You feed.

2. **Transparent Scoring Formula**:
   $$\text{score} = \text{interestRelevance} + \text{interactionRelevance} + \text{recencyScore} - \text{diversityPenalty}$$
   - **Interest Relevance**: Explicit preferred topics (+40 pts/match); inferred topic weights derived from interactions (+10 * weight, capped at 30 pts).
   - **Interaction Relevance**: Followed authors (+25 pts); prior user interactions (+15 pts).
   - **Recency Contribution**: Exponential decay over 24 hours: $30 \times \exp(-\text{ageInHours} / 24)$.
   - **Diversity Adjustment**: Author repetition penalty ($-20 \times \text{seenAuthorCount}$) and topic repetition penalty ($-5 \times \text{seenTopicCount}$).
   - **Author Reduction**: Heavy penalty ($-100$ pts) for authors configured in the user's reduced authors list.
   - **Stable Tie-Breaking**: Deterministic sorting by `score DESC`, `createdAt DESC`, and `id DESC`.

3. **Truthful, Understandable Explanations**:
   - Posts matching an explicit topic carry: `"Recommended because you follow #${topic}"`.
   - Posts matching an inferred topic carry: `"Recommended because you frequently interact with posts about #${topic}"`.
   - Posts from followed authors carry: `"Recommended because you follow @${username}"`.
   - Posts matching past interactions carry: `"Recommended because you previously interacted with this or similar content"`.
   - Fallback posts carry: `"Recommended based on recent popular activity"`.
   - Explanations never expose private interaction details or make unsupported claims.

4. **User Controls**:
   - **Topic Muting**: Normalizes topics (lowercase, leading `#` stripped). Candidate posts containing any muted topic are completely excluded.
   - **Author Reduction**: Strongly penalizes designated authors without blocking or unfollowing them across the instance.
   - **Profile Reset**: Clears `mutedTopics`, `reducedAuthors`, `preferredTopics`, and `topicWeights` back to defaults. Unrelated user data (posts, bookmarks, reactions, follows) is strictly preserved.

5. **Hard Visibility & Moderation Enforcement**:
   - Only eligible public notes (`visibility === 'public'`) are permitted in candidate selection.
   - Followers-only, home-visibility, and direct message notes are strictly excluded.
   - Notes by blocked users (in either direction) or muted users are excluded.
   - Notes by deleted or suspended authors are excluded.
   - Notes containing unresolved CH03 malicious links are strictly excluded.

6. **Caching & Invalidation**:
   - User-scoped cache isolated strictly to the requesting user's ID.
   - Immediate cache invalidation when preferences are updated, topics muted, authors reduced, or profiles reset.
   - No cross-user recommendation data leakage.

---

## 3. Relevant Source Modules

| Component | Path | Responsibility |
|---|---|---|
| **Data Entity** | `packages/backend/src/models/RecommendationPreference.ts` | TypeORM entity storing user recommendation controls and weights |
| **Migration** | `packages/backend/migration/1788000000000-recommendation-preferences.js` | Schema migration creating `recommendation_preference` table |
| **DI Wiring** | `packages/backend/src/models/_.ts`, `RepositoryModule.ts`, `di-symbols.ts`, `postgres.ts` | Type exports, symbols, repository providers, and database registration |
| **Strategy Pattern** | `packages/backend/src/core/recommendation/RecommendationStrategy.ts` | Interface `RecommendationRankingStrategy` and concrete strategies (`WeightedPersonalizedRankingStrategy`, `ChronologicalRankingStrategy`) |
| **Recommendation Service** | `packages/backend/src/core/RecommendationService.ts` | Candidate retrieval, hard safety/visibility filtering, ranking execution, caching, preference management |
| **Core Module** | `packages/backend/src/core/CoreModule.ts` | NestJS dependency injection registration for `RecommendationService` |
| **API Endpoints** | `packages/backend/src/server/api/endpoints/recommendations/` | `for-you.ts`, `preferences.ts`, `preferences/update.ts`, `preferences/reset.ts` |
| **API Routing** | `packages/backend/src/server/api/endpoint-list.ts` | Endpoint registration in Misskey API table |
| **Frontend Note** | `packages/frontend/src/components/MkNote.vue` | Explanation badge display (`recommendationReason`) |
| **Frontend Feed** | `packages/frontend/src/pages/for-you.vue` | Dedicated timeline page with mode selector and controls modal |
| **Unit Tests** | `packages/backend/test/unit/RecommendationService.test.ts` | Focused automated tests covering ranking, explanations, controls, visibility, pagination, and cache |

---

## 4. Scope Exclusions
- No training or deployment of opaque deep learning models or external proprietary AI APIs.
- No modification or silent reordering of existing Home, Local, Social, or Global chronological timelines.
- No alteration or regressions of CH01 (Events), CH02 (Audio Posts), or CH03 (Link Safety) features.
- No platform-wide side-effects when reducing an author (does not block, unfollow, or mute).
