# Change 4 (CH04) Verification Report

## 1. Executive Summary
- **Feature**: Explainable, User-Controlled Personalized Feed in Misskey
- **Baseline Commit**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Preceding Commit**: `39e3c987488d59045cc3ed5cfe532f6f32c0936d` (CH03)
- **Implementation Commit**: `b3040278d3e63cf4ced915f9623b95969ff42010`
- **Execution Date**: 2026-10-11
- **Working Tree**: Clean (`git status` is clean)

---

## 2. Claims Verification Matrix

| Claim # | Claim Description | Target Source Location | Verification Method | Status | Notes / Limitations |
|---|---|---|---|---|---|
| **C-01** | Separate, opt-in recommendation feed endpoint (`recommendations/for-you`) and page (`for-you.vue`) | `packages/backend/src/server/api/endpoints/recommendations/for-you.ts`, `packages/frontend/src/pages/for-you.vue` | Source & Contract Inspection | **CORRECT** | Existing timelines (Home, Local, Social) remain strictly untouched. |
| **C-02** | Explicit preferred topics outrank unrelated posts (+40 pts) | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:65-80` | Unit Test (15.1) | **CORRECT** | Verified in `RecommendationService.test.ts`. |
| **C-03** | Inferred topic weights boost ranking proportionally | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:75-85` | Unit Test (15.1) | **CORRECT** | Verified in `RecommendationService.test.ts`. |
| **C-04** | Followed author (+25 pts) and prior user interactions (+15 pts) boost rank | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:85-95` | Unit Test (15.1) | **CORRECT** | Verified in `RecommendationService.test.ts`. |
| **C-05** | Recency exponential decay prioritizes fresh posts | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:95-105` | Unit Test (15.1) | **CORRECT** | Verified exponential decay over 24h. |
| **C-06** | Author diversity penalty suppresses consecutive posts from the same author | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:130-170` | Unit Test (15.1) | **CORRECT** | Verified author count penalty reorders candidates. |
| **C-07** | Reduced-recommendation author receives heavy suppression penalty (-100 pts) | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:100-110` | Unit Test (15.1) | **CORRECT** | Heavily suppresses author without platform-wide block or unfollow. |
| **C-08** | Deterministic tie-breaking produces repeatable results | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:140-160` | Unit Test (15.1) | **CORRECT** | Tie-break by score, createdAt, and id. |
| **C-09** | Truthful, explainable recommendation reasons emitted | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:180-210` | Unit Tests (15.2) | **CORRECT** | Emits `#topic`, followed author, interaction, or fallback reasons truthfully. |
| **C-10** | Topic muting strictly excludes candidate notes | `packages/backend/src/core/RecommendationService.ts:180-210` | Unit Test (15.3) | **CORRECT** | Muted topics excluded at candidate filter and ranking stages. |
| **C-11** | Profile reset clears recommendation state without touching user data | `packages/backend/src/core/RecommendationService.ts:140-160` | Unit Test (15.3) | **CORRECT** | Verified bookmarks, notes, reactions, and follows are preserved. |
| **C-12** | Topic normalization handles casing and hash symbols | `packages/backend/src/core/RecommendationService.ts:40-60` | Unit Test (15.3) | **CORRECT** | Strips `#`, trims, and lowercases. |
| **C-13** | Non-public notes (home, followers, specified) strictly excluded | `packages/backend/src/core/RecommendationService.ts:175-195` | Unit Test (15.4) | **CORRECT** | Hard constraint: only `visibility === 'public'` allowed. |
| **C-14** | Blocked and muting users strictly excluded | `packages/backend/src/core/RecommendationService.ts:185-195` | Unit Test (15.4) | **CORRECT** | Both blocker and blockee relations filtered out. |
| **C-15** | CH03 malicious links strictly excluded from For You feed | `packages/backend/src/core/RecommendationService.ts:190-205` | Unit Test (15.4) | **CORRECT** | Verified integration with CH03 `flagged_link` repository. |
| **C-16** | Chronological mode orders strictly by createdAt descending | `packages/backend/src/core/recommendation/RecommendationStrategy.ts:220-250` | Unit Test (15.5) | **CORRECT** | Sorts by publication time with "Chronological timeline order" explanation. |
| **C-17** | User-scoped cache isolation and invalidation | `packages/backend/src/core/RecommendationService.ts:115-135, 230-245` | Unit Test (15.6) | **CORRECT** | Cache is scoped strictly by `userId` and invalidated on updates. |
| **C-18** | Frontend note badge displays recommendation reason | `packages/frontend/src/components/MkNote.vue:15-18, 465-480` | Component Inspection | **CORRECT** | Renders sparkler badge with `appearNote.recommendationReason`. |
| **C-19** | Live PostgreSQL migration execution | `packages/backend/migration/1788000000000-recommendation-preferences.js` | Migration file check | **CANNOT BE CONFIRMED (LIVE DB)** | PostgreSQL daemon offline in local test environment; migration SQL and TypeORM entity verified. |

---

## 3. Automated Test Verification Details
- **Command**: `pnpm --filter backend exec vitest run test/unit/RecommendationService.test.ts --config vitest.config.unit.ts`
- **Output**: 20 passed (20 total) in 481ms
- **Exit Code**: `0`
- **Regression Suite**: `EventService.test.ts` (21 passed), `AudioTranscriptService.test.ts` (21 passed), `LinkSafetyService.test.ts` (29 passed), `RecommendationService.test.ts` (20 passed) — total 91 passed, 0 failed in 2.76s
- **Log Saved At**: `A1/Part2/changes/Change4/test_result.log`

---

## 4. Git and Commit Verification
- **Commit SHA**: `b3040278d3e63cf4ced915f9623b95969ff42010`
- **Preceding SHA**: `39e3c987488d59045cc3ed5cfe532f6f32c0936d`
- **Diffstat**: 17 files changed, 1874 insertions(+)
- **Working Tree**: Clean, verified via `git status`
- **Patch Artifact**: `A1/Part2/changes/Change4/diff.patch` matches the exact diff from preceding commit `39e3c9874`.
