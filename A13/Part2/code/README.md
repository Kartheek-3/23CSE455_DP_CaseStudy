# Evolved Application Source & Part 2 Code Evidence

## 1. Repository & Baseline Information
- **Misskey Repository URL**: `https://github.com/vighnesh1001/misskey.git`
- **Upstream Repository**: `https://github.com/misskey-dev/misskey.git`
- **Initial Branch**: `develop`
- **Baseline Commit SHA**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Change 1 (CH01) Implementation Commit SHA**: `608b45de20dce0a78459025320bfdeb0c4e47a78`
- **Change 2 (CH02) Implementation Commit SHA**: `9a4398a103e392a0ea634eaf521470985985145d`
- **Change 3 (CH03) Implementation Commit SHA**: `39e3c987488d59045cc3ed5cfe532f6f32c0936d`
- **Change 4 (CH04) Implementation Commit SHA**: `b3040278d3e63cf4ced915f9623b95969ff42010`

---

## 2. Completed Changes & Commit History
- **Baseline**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Change 1 (CH01)**: `608b45de20dce0a78459025320bfdeb0c4e47a78` — *feat: add native events with RSVP and reminders*
- **Change 2 (CH02)**: `9a4398a103e392a0ea634eaf521470985985145d` — *feat: add first-class audio posts with transcription*
- **Change 3 (CH03)**: `39e3c987488d59045cc3ed5cfe532f6f32c0936d` — *feat: add context-aware link safety and spam protection*
- **Change 4 (CH04)**: `b3040278d3e63cf4ced915f9623b95969ff42010` — *feat: add explainable personalized feed*

---

## 3. Production Source Paths & Migrations

### 3.1 Change 1 Production Files
- `packages/backend/src/models/Event.ts` (Event entity)
- `packages/backend/src/models/EventRsvp.ts` (RSVP attendance entity)
- `packages/backend/src/core/EventService.ts` (EventService & `EventReminderSchedule` value object)
- `packages/backend/migration/1785000000000-events.js` (Events & RSVPs migration)
- `packages/backend/src/server/api/endpoints/events/*.ts` (6 event API endpoints)
- `packages/frontend/src/components/MkEventCard.vue` (Event card component)

### 3.2 Change 2 Production Files
- `packages/backend/src/models/AudioTranscript.ts` (Audio transcript entity)
- `packages/backend/migration/1786000000000-audio-transcripts.js` (Audio transcript migration)
- `packages/backend/src/core/AudioTranscriptService.ts` (AudioTranscriptService & `AudioTranscriptStateMachine`)
- `packages/backend/src/core/audio/AudioTranscriptionProvider.ts` (Provider strategy interfaces & classes)
- `packages/backend/src/server/api/endpoints/audio/transcribe.ts` (Request transcription)
- `packages/backend/src/server/api/endpoints/audio/transcript/show.ts` (Show transcript)
- `packages/backend/src/server/api/endpoints/audio/transcript/update.ts` (Update draft)
- `packages/backend/src/server/api/endpoints/audio/transcript/approve.ts` (Approve transcript)
- `packages/backend/src/server/api/endpoints/audio/transcript/search.ts` (Search published transcripts)
- `packages/frontend/src/utility/audio-recorder.ts` (Browser audio recorder utility)
- `packages/frontend/src/components/MkAudioPlayer.vue` (Interactive waveform player and transcript editor)
- `packages/frontend/src/components/MkMediaAudio.vue` (Integrated player component)

### 3.3 Change 3 Production Files
- `packages/backend/src/models/FlaggedLink.ts` (FlaggedLink entity)
- `packages/backend/migration/1787000000000-flagged-links.js` (Flagged links migration)
- `packages/backend/src/core/security/LinkReputationProvider.ts` (Reputation provider strategy hierarchy)
- `packages/backend/src/core/security/LinkSafetyService.ts` (URL normalizer, SSRF guard, homographs, spam frequency analyzer, cache)
- `packages/backend/src/server/api/endpoints/links/check.ts` (Draft link safety check endpoint)
- `packages/backend/src/server/api/endpoints/admin/links/flagged.ts` (Admin review endpoint)
- `packages/backend/src/server/api/endpoints/admin/links/rules/update.ts` (Admin domain rule update endpoint)
- `packages/frontend/src/components/MkPostForm.vue` (Composer link safety watcher and advisory banner)
- `packages/frontend/src/components/global/MkUrl.vue` (Reader risk warning icon and navigation guard modal)

### 3.4 Change 4 Production Files
- `packages/backend/src/models/RecommendationPreference.ts` (RecommendationPreference entity)
- `packages/backend/migration/1788000000000-recommendation-preferences.js` (Recommendation preferences migration)
- `packages/backend/src/core/recommendation/RecommendationStrategy.ts` (Strategy pattern: `RecommendationRankingStrategy`, `WeightedPersonalizedRankingStrategy`, `ChronologicalRankingStrategy`)
- `packages/backend/src/core/RecommendationService.ts` (Candidate collection, hard privacy/safety filters, ranking, caching, preferences)
- `packages/backend/src/server/api/endpoints/recommendations/for-you.ts` (For You recommendation feed API endpoint)
- `packages/backend/src/server/api/endpoints/recommendations/preferences.ts` (Read preferences endpoint)
- `packages/backend/src/server/api/endpoints/recommendations/preferences/update.ts` (Update preferences endpoint)
- `packages/backend/src/server/api/endpoints/recommendations/preferences/reset.ts` (Reset profile endpoint)
- `packages/frontend/src/components/MkNote.vue` (Recommendation explanation banner `recommendationTip`)
- `packages/frontend/src/pages/for-you.vue` (Dedicated For You timeline page with mode toggle and controls modal)

### 3.5 Common Registrations
- `packages/backend/src/di-symbols.ts`
- `packages/backend/src/core/CoreModule.ts`
- `packages/backend/src/models/RepositoryModule.ts`
- `packages/backend/src/models/_.ts`
- `packages/backend/src/postgres.ts`
- `packages/backend/src/server/api/endpoint-list.ts`

---

## 4. Focused Automated Test Execution & Results

### 4.1 Change 1 Test Command & Results
```bash
cd /home/vighnesh/DP-case_study/misskey
pnpm --filter backend exec vitest run test/unit/EventService.test.ts --config vitest.config.unit.ts
```
- **Results**: 21 passed (21 total) in 1.65s (Exit code: 0)
- **Log**: `A1/Part2/changes/Change1/test_result.log`

### 4.2 Change 2 Test Command & Results
```bash
cd /home/vighnesh/DP-case_study/misskey
pnpm --filter backend exec vitest run test/unit/AudioTranscriptService.test.ts --config vitest.config.unit.ts
```
- **Results**: 21 passed (21 total) in 390ms (Exit code: 0)
- **Log**: `A1/Part2/changes/Change2/test_result.log`

### 4.3 Change 3 Test Command & Results
```bash
cd /home/vighnesh/DP-case_study/misskey
pnpm --filter backend exec vitest run test/unit/LinkSafetyService.test.ts --config vitest.config.unit.ts
```
- **Results**: 29 passed (29 total) in 543ms (Exit code: 0)
- **Log**: `A1/Part2/changes/Change3/test_result.log`

### 4.4 Change 4 Test Command & Results
```bash
cd /home/vighnesh/DP-case_study/misskey
pnpm --filter backend exec vitest run test/unit/RecommendationService.test.ts --config vitest.config.unit.ts
```
- **Results**: 20 passed (20 total) in 481ms (Exit code: 0)
- **Log**: `A1/Part2/changes/Change4/test_result.log`

### 4.5 Full Regression Suite (CH01 + CH02 + CH03 + CH04)
```bash
cd /home/vighnesh/DP-case_study/misskey
pnpm --filter backend exec vitest run test/unit/EventService.test.ts test/unit/AudioTranscriptService.test.ts test/unit/LinkSafetyService.test.ts test/unit/RecommendationService.test.ts --config vitest.config.unit.ts
```
- **Results**: 91 passed (91 total) in 2.76s (Exit code: 0)

---

## 5. Source Measurement Rules
- Source lines of code (SLOC) were counted using Python SLOC measurement (excluding blank lines and pure comments).
- Physical lines measured via `git diff --stat`.
- Metrics documented in:
  - `A1/Part2/changes/Change1/metrics.csv`
  - `A1/Part2/changes/Change2/metrics.csv`
  - `A1/Part2/changes/Change3/metrics.csv`
  - `A1/Part2/changes/Change4/metrics.csv`

---

## 6. How to Retrieve Evolved Application Source from Git
From the Misskey repository directory (`/home/vighnesh/DP-case_study/misskey`):
```bash
# Verify the Change 4 implementation commit
git show b3040278d3e63cf4ced915f9623b95969ff42010

# Inspect the diff between Change 3 and Change 4
git diff 39e3c987488d59045cc3ed5cfe532f6f32c0936d..b3040278d3e63cf4ced915f9623b95969ff42010

# Checkout the Change 4 implementation snapshot
git checkout b3040278d3e63cf4ced915f9623b95969ff42010
```

---

## 7. Environment & Security Limitations
1. **Explainable Transparent Ranking**: Uses a deterministic weighted scorer with Strategy pattern. No opaque machine learning models or external paid AI APIs.
2. **Opt-in & Strict Separation**: Preserves existing chronological timelines without modification. For You feed is strictly opt-in and accessible via `/for-you`.
3. **Hard Privacy Enforcement**: Non-public notes, blocked/muted authors, deleted/suspended users, muted topics, and CH03 malicious links are excluded before ranking.
4. **Non-Destructive Profile Reset**: Resetting recommendation preferences clears personalization weights without deleting user bookmarks, notes, reactions, or follows.
5. **Database & Cache Services**: Shared PostgreSQL (port 54312) and Redis (port 56312) daemons were inactive in the local test environment. Focused tests run against in-memory repository doubles.
