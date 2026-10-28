# Change 3 (CH03) Input Context Report

## 1. Preceding Source Commit and Baseline
- **Original Baseline SHA**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Preceding Verified Commit SHA**: `9a4398a103e392a0ea634eaf521470985985145d` (Change 2 - First-Class Audio Posts with Transcription)
- **Branch**: `develop`
- **Working Tree State**: Clean working tree before CH03 implementation
- **Environment**: Node.js `v22.23.1`, pnpm `11.25.0`, Fedora Linux 44 Workstation, Git `2.51.0`

---

## 2. Source Files Inspected Prior to Implementation
1. **SSRF Guard & HTTP Infrastructure**:
   - `packages/backend/src/core/HttpRequestService.ts`: Traced outbound HTTP agent socket interceptor, `ipaddr.js` integration, and `range() !== 'unicast'` check.
2. **URL Preview & Link Parsing**:
   - `packages/backend/src/server/web/UrlPreviewService.ts`: Inspected existing link-preview fetching mechanisms, summary extractors, and limitations.
3. **Abuse Reporting & Moderation**:
   - `packages/backend/src/models/AbuseUserReport.ts`: Inspected community report schema (`reporterId`, `userId`, `comment`, `assigneeId`, `resolved`).
   - `packages/backend/src/models/ModerationLog.ts`: Moderation action logging schema.
4. **Post Composition & Link Rendering**:
   - `packages/frontend/src/components/global/MkUrl.vue`: Examined URL display parser (`parseUrlForDisplay`), link preview tooltip, and click behavior.
   - `packages/frontend/src/components/MkPostForm.vue`: Examined note composer state, draft text watcher, mentions warning (`MkInfo`), and submission pipeline.
5. **Dependency Injection & Persistence Registry**:
   - `packages/backend/src/di-symbols.ts`: DI token registry for repositories and services.
   - `packages/backend/src/models/RepositoryModule.ts`: TypeORM provider factories.
   - `packages/backend/src/core/CoreModule.ts`: Core service providers and exports.
   - `packages/backend/src/server/api/endpoint-list.ts`: Central endpoint registry.

---

## 3. Feature Constraints and Security Decisions
1. **Strict SSRF Defense & No Remote Crawling**:
   - Section 7 explicitly prohibits unrestricted server-side URL fetching.
   - To completely eliminate SSRF, DNS rebinding, and resource-exhaustion vectors, the link safety system avoids fetching arbitrary destination response bodies or following unrestricted remote redirects.
   - Address ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `100.64.0.0/10`, `224.0.0.0/4`, `::1`, `::ffff:127.0.0.1`, `localhost`, `.local`) are strictly validated and blocked via `ipaddr.js`.
2. **Pluggable Threat Intelligence (Strategy Pattern)**:
   - Does not require a paid external service (e.g., Google Safe Browsing, VirusTotal).
   - Introduces `LinkReputationProvider` interface with deterministic local lists (`LocalListReputationProvider`), mock doubles (`MockReputationProvider`), and disabled modes.
3. **Non-Destructive Advisory Posture**:
   - Heuristic scores and community reports do not automatically delete posts or ban users.
   - Outcomes are advisory warnings in the post composer, warning badges/navigation confirmation dialogs for readers, and persistent audit entries for administrator review.
4. **Offline Database & Test Environment**:
   - Unit tests run deterministically in Vitest using in-memory mock repositories and test fixtures without requiring live cloud threat intelligence or running database daemons.
