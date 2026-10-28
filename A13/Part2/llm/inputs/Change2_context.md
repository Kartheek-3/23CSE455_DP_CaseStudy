# Change 2 (CH02) Input Context Report

## 1. Preceding Source Commit and Baseline
- **Original Baseline SHA**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Preceding Commit SHA**: `608b45de20dce0a78459025320bfdeb0c4e47a78` (Change 1 - Native Events, RSVP and Reminders)
- **Branch**: `develop`
- **Working Tree State**: Clean working tree before CH02 implementation
- **Environment**: Node.js `v22.23.1`, pnpm `11.25.0`, Fedora Linux 44 Workstation, Git `2.51.0`

---

## 2. Source Files Inspected Prior to Implementation
1. **Drive Storage & Media Model**:
   - `packages/backend/src/models/DriveFile.ts`: Inspected DriveFile entity structure (`id`, `userId`, `type`, `size`, `url`, `md5`).
   - `packages/backend/src/models/Note.ts`: Inspected note attachment references (`fileIds: MiDriveFile['id'][]`, `attachedFileTypes: string[]`).
2. **Search Architecture**:
   - `packages/backend/src/core/SearchService.ts`: Inspected note full-text search implementation, `SearchOpts`, visibility query generation (`generateVisibilityQuery`, `generateUgcVisibilityQueryForVisitor`).
   - `packages/backend/src/server/api/endpoints/notes/search.ts`: Inspected endpoint parameter schema and user policy checks.
3. **Frontend Media Display & Composition**:
   - `packages/frontend/src/components/MkMediaAudio.vue`: Traced existing static SVG waveform thumbnail and lightbox click handler.
   - `packages/frontend/src/components/MkMediaList.vue`: Traced media attachment rendering (`XAudio`, `XVideo`, `XImage`).
   - `packages/frontend/src/components/MkLightbox.item.vue`: Traced audio playback options (`useNativeUiForVideoAudioPlayer`).
4. **Backend Architecture & DI Registry**:
   - `packages/backend/src/di-symbols.ts`: DI token registrations.
   - `packages/backend/src/models/RepositoryModule.ts`: TypeORM repository factory providers.
   - `packages/backend/src/core/CoreModule.ts`: Core service providers and exports.
   - `packages/backend/src/server/api/endpoint-list.ts`: Central endpoint registry.

---

## 3. Feature Constraints and Test Environment Assumptions
1. **No Paid API Dependency**:
   - Transcription must support self-hosted/local engines without mandatory dependence on paid external cloud APIs (e.g. Google Cloud Speech, OpenAI Cloud API).
   - Designed a strategy abstraction (`AudioTranscriptionProvider`) with `MockTranscriptionProvider` and `LocalWhisperTranscriptionProvider`.
2. **Author Approval Prerequisite**:
   - Generated transcripts must remain unlisted drafts until explicitly approved and published by the author. Unapproved drafts must be strictly excluded from search and third-party access.
3. **Offline Database & Cache Services**:
   - As established in preflight, PostgreSQL daemon (port 54312) and Redis daemon (port 56312) were inactive locally. Tests utilize deterministic in-memory TypeORM repository doubles within Vitest.
4. **Federation Exclusion**:
   - Remote ActivityPub federation of audio transcript objects was explicitly excluded per specification.
