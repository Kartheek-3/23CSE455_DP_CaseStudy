# Change 2 (CH02) Requirement Document: First-Class Audio Posts with Transcription in Misskey

## 1. Feature Objective
Implement a first-class audio-post experience integrated into Misskey's existing post composition, media handling, and note display workflows. The feature adds:
- Dedicated audio recording and upload workflows.
- Audio playback with interactive waveform representations, time/duration labels, and accessible controls.
- Speech-to-text transcription powered by a provider strategy abstraction (without mandatory paid API dependencies).
- Author review, correction, and approval workflows where transcripts remain unlisted drafts until explicitly published.
- Expandable transcript presentations for listeners.
- Full-text searchability of published transcripts that strictly respects note visibility rules and excludes drafts.

---

## 2. Observable Acceptance Criteria
1. **Audio Handling & Compatibility**:
   - Audio files (`audio/*` MIME types) can be attached and rendered in posts.
   - Non-audio uploads or invalid MIME types are rejected appropriately with `INVALID_FILE_TYPE`.
   - Existing audio attachments continue working seamlessly without regressions.
   - Missing metadata or waveform extraction issues fall back gracefully without breaking playback.
2. **Transcription Provider Abstraction**:
   - Provider interface (`AudioTranscriptionProvider`) decouples business logic from speech recognition engines.
   - Supports non-paid / local deployment paths (such as `MockTranscriptionProvider` and self-hosted `LocalWhisperTranscriptionProvider`).
   - Disabled provider states return `failed` status gracefully without rendering the audio post unusable.
3. **Draft Review & Publication Lifecycle**:
   - Transcription jobs store output with `status = 'draft'`.
   - Generated transcripts are not publicly displayed or searchable until author approval.
   - The author can inspect draft text, edit corrections, and approve publication (`status = 'approved'`).
   - Non-authors cannot view, edit, approve, or discard another author's draft transcript.
4. **Searchability & Visibility Restrictions**:
   - Published transcripts are searchable via API endpoints.
   - Search results strictly exclude draft, queued, or failed transcripts.
   - Content visibility (public, home, specified, followers) is preserved; private/inaccessible notes do not leak transcript text in search results.
5. **State Invariants & Idempotency**:
   - Transitions between states (`queued`, `processing`, `draft`, `approved`, `failed`) are governed by `AudioTranscriptStateMachine`.
   - Duplicate transcription requests on existing transcripts do not spawn redundant jobs.
   - Retries on failed transcripts transition cleanly back to `queued`.

---

## 3. Key Architectural Decisions
- **Persistence Model**: Introduced `MiAudioTranscript` entity associated with `DriveFile` via a composite unique constraint on `fileId`, ensuring one transcript record per audio clip.
- **Provider Strategy Pattern**: Introduced `AudioTranscriptionProvider` strategy pattern (`MockTranscriptionProvider`, `LocalWhisperTranscriptionProvider`, `DisabledTranscriptionProvider`) to allow self-hosted and offline execution without paid third-party dependencies.
- **State Machine Pattern (Refactoring)**: Replaced nested conditional type checks with `AudioTranscriptStateMachine` to govern lifecycle states and prevent invalid operations.
- **Frontend Component Integration**: Created `MkAudioPlayer.vue` providing an accessible waveform player with transcript review/reading drawer, integrated into `MkMediaAudio.vue`.
- **Browser Audio Recording**: Created `AudioRecorder` utility using `MediaRecorder` and `navigator.mediaDevices.getUserMedia`.

---

## 4. Affected Misskey Source Modules
- **Domain Models & Migrations**:
  - `packages/backend/src/models/AudioTranscript.ts`
  - `packages/backend/migration/1786000000000-audio-transcripts.js`
  - `packages/backend/src/models/_.ts`
  - `packages/backend/src/models/RepositoryModule.ts`
  - `packages/backend/src/postgres.ts`
  - `packages/backend/src/di-symbols.ts`
- **Core Domain Services**:
  - `packages/backend/src/core/AudioTranscriptService.ts`
  - `packages/backend/src/core/audio/AudioTranscriptionProvider.ts`
  - `packages/backend/src/core/CoreModule.ts`
- **API Endpoints**:
  - `packages/backend/src/server/api/endpoints/audio/transcribe.ts`
  - `packages/backend/src/server/api/endpoints/audio/transcript/show.ts`
  - `packages/backend/src/server/api/endpoints/audio/transcript/update.ts`
  - `packages/backend/src/server/api/endpoints/audio/transcript/approve.ts`
  - `packages/backend/src/server/api/endpoints/audio/transcript/search.ts`
  - `packages/backend/src/server/api/endpoint-list.ts`
- **Frontend Components & Utilities**:
  - `packages/frontend/src/utility/audio-recorder.ts`
  - `packages/frontend/src/components/MkAudioPlayer.vue`
  - `packages/frontend/src/components/MkMediaAudio.vue`
- **Automated Tests**:
  - `packages/backend/test/unit/AudioTranscriptService.test.ts`

---

## 5. Assumptions and Exclusions
- **ActivityPub Federation**: Federation of speech transcripts to remote Fediverse instances is out of scope.
- **Third-Party Paid APIs**: Mandatory paid transcription APIs (e.g. OpenAI Whisper Cloud, Google Speech-to-Text) were explicitly excluded in favor of configurable local/self-hosted strategies.
- **Test Doubles**: Because local PostgreSQL and Redis daemons were inactive in the development container, persistence and query checks were executed deterministically via in-memory TypeORM repository doubles.
