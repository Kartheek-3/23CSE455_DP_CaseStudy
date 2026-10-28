# Change 3 (CH03) Requirement Document: Context-Aware Link Safety and Spam Protection in Misskey

## 1. Feature Objective
Implement a comprehensive, context-aware link safety and spam protection layer in the Misskey application to prevent users from interacting with known malicious or suspicious destinations and identify repeated promotional/spam-like posting behavior.

The system complements Misskey's existing moderation, reporting, blocking, and administrative mechanisms by providing proactive, explainable safety analysis without silently discarding legitimate content or duplicating existing moderation workflows.

The feature comprises:
- **URL Parsing, Canonicalisation, and Risk Analysis**: Robust URL normalization conforming to WHATWG standards, handling Punycode/IDN hostnames, explicit ports, userinfo components, and rejecting dangerous schemes.
- **SSRF & Destination Safeguards**: Strict rejection of private, loopback, link-local, multicast, carrier-grade NAT, and internal local host destinations without executing arbitrary server-side response body downloads.
- **Misleading Domain & Homograph Detection**: Heuristic confusable detection identifying mixed-script/Cyrillic lookalikes imitating high-profile trusted domains as an advisory risk signal.
- **Threat Intelligence & Reputation Provider Strategy**: Pluggable `LinkReputationProvider` Strategy pattern supporting local administrator-maintained block/allowlists, deterministic test mocks, and known URL shortener detection.
- **Reputation Caching & Explainability**: In-memory caching with differential TTLs and clear, explainable threat types and rationales without leaking internal configuration secrets.
- **Spam & Repeated Promotional Pattern Analysis**: Rule-based sliding window frequency analysis detecting burst link posting and deduplicating community abuse reports.
- **Composer Safety Warnings**: Interactive, non-blocking advisory banner in the note drafting interface alerting authors before publication.
- **Reader-Facing Risk Indicators**: Accessible warning badges and destination confirmation dialogs in `MkUrl.vue` before readers navigate to suspicious destinations.
- **Administrative Configuration & Review**: Endpoints for reviewing flagged URLs/domains with provenance and managing dynamic instance rules.

---

## 2. Observable Acceptance Criteria

1. **URL Syntax, Normalization & Scheme Validation**:
   - Parses and normalises HTTP and HTTPS URLs into canonical form (`lowercase hostname`, `stripped trailing dot`, `default ports 80/443 omitted`, `preserved non-default ports`).
   - Identifies and flags URLs embedding userinfo credentials (`https://admin:pass@host/`) preceding the host.
   - Rejects unsupported or dangerous schemes (`javascript:`, `file:`, `ftp:`) with clear categorization (`suspicious`, `unsupported scheme`).
   - Supports Internationalized Domain Names (IDN) and Punycode (`xn--...`) representations without blocking legitimate non-ASCII domains.

2. **Server-Side Request Forgery (SSRF) Safeguards**:
   - Validates destination addresses against prohibited IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `100.64.0.0/10`, `224.0.0.0/4`, `::1`, `::ffff:127.0.0.1`, `localhost`, `.local`).
   - Marks direct attempts to link to prohibited internal destinations as `malicious` (`ip_direct` / SSRF guard).
   - Does NOT download or evaluate arbitrary remote response bodies, ensuring no blind SSRF or resource-exhaustion exposure.

3. **Homograph & Confusable Domain Detection**:
   - Detects Cyrillic and Greek homoglyphs imitating protected trusted domains (e.g. `gооgle.com`, `раypal.com`).
   - Does not flag genuine, valid ASCII domains (e.g. `google.com`).
   - Classifies confusable representations as `suspicious` with threat type `homograph`.

4. **Reputation Provider Abstraction & Caching**:
   - Uses Strategy pattern decoupled from paid external APIs.
   - `LocalListReputationProvider` accurately returns `benign` for allowlisted domains, `malicious` for blocklisted domains, and `suspicious` for known shorteners (`bit.ly`, `tinyurl.com`).
   - `MockReputationProvider` supports deterministic verdicts and failure simulations.
   - Provider timeouts and network errors gracefully yield `unknown` without false positives.
   - Cache avoids duplicate evaluation of identical canonical destinations within TTL.

5. **Spam & Repeated Promotional Pattern Analysis**:
   - Detects repeated posting of the exact same canonical URL by the same user within 5 minutes (> 2 occurrences).
   - Detects high-frequency link bursts to the same domain within 10 minutes (> 4 occurrences).
   - Deduplicates community abuse reports by reporter to prevent coordinated reporting attacks from manipulating domain scores.
   - Retains advisory posture: never silently deletes valid notes solely due to heuristic scores.

6. **Composer & Reader Integration**:
   - Note composer displays non-blocking advisory banner when draft content contains suspicious or malicious links.
   - Reader link component (`MkUrl.vue`) displays warning icon and requires confirmation before navigating to suspicious/credential-embedded links.
   - Existing note submission, link previews, and note rendering remain completely intact.

7. **Administrative Review**:
   - Flagged links are persisted to `flagged_link` database table for auditing.
   - `admin/links/flagged` allows administrators to review flagged links with risk categories, reasons, threat types, and resolve status.
   - `admin/links/rules/update` allows instance administrators to block, allow, or remove domain rules dynamically.

---

## 3. Key Architectural Decisions

- **Persistence Model**: Introduced `MiFlaggedLink` entity and migration `1787000000000-flagged-links.js` to record audit entries without polluting core note entities or duplicating user report tables.
- **Provider Strategy Pattern**: Introduced `LinkReputationProvider` interface (`classify(target: NormalizedUrl)`) with concrete implementations `LocalListReputationProvider`, `MockReputationProvider`, and `DisabledReputationProvider`.
- **Decoupled Spam Scoring**: Separated URL canonicalization, SSRF protection, reputation lookup, homograph detection, and user frequency tracking into distinct, testable methods within `LinkSafetyService`.
- **Strict SSRF Immunity**: Avoided arbitrary server-side redirect following or remote body fetching; relied on address range validation via `ipaddr.js` and canonicalized host evaluation.
- **Advisory UI Pattern**: Frontend integration in `MkPostForm.vue` and `MkUrl.vue` is purely advisory and transparent, honoring user agency while shielding readers from deceptive destinations.

---

## 4. Affected Misskey Source Scope

- **Domain Models & Migrations**:
  - `packages/backend/src/models/FlaggedLink.ts`
  - `packages/backend/migration/1787000000000-flagged-links.js`
  - `packages/backend/src/models/_.ts`
  - `packages/backend/src/models/RepositoryModule.ts`
  - `packages/backend/src/postgres.ts`
  - `packages/backend/src/di-symbols.ts`
- **Core Domain Services & Strategies**:
  - `packages/backend/src/core/security/LinkReputationProvider.ts`
  - `packages/backend/src/core/security/LinkSafetyService.ts`
  - `packages/backend/src/core/CoreModule.ts`
- **API Endpoints**:
  - `packages/backend/src/server/api/endpoints/links/check.ts`
  - `packages/backend/src/server/api/endpoints/admin/links/flagged.ts`
  - `packages/backend/src/server/api/endpoints/admin/links/rules/update.ts`
  - `packages/backend/src/server/api/endpoint-list.ts`
- **Automated Tests**:
  - `packages/backend/test/unit/LinkSafetyService.test.ts`
- **Frontend Components**:
  - `packages/frontend/src/components/global/MkUrl.vue`
  - `packages/frontend/src/components/MkPostForm.vue`

---

## 5. Security & Architectural Limitations

- **No Arbitrary Body Crawling**: The service does not download arbitrary HTML pages or execute remote JavaScript to prevent server-side compromise, SSRF, and compute exhaustion.
- **Homograph Heuristics**: Confusable detection is an advisory heuristic based on lookalike scripts against common brands; it does not claim exhaustive coverage of all possible Unicode confusables.
- **Non-Destructive Enforcement**: Advisory findings are presented to users and moderators but do not automatically drop notes or suspend accounts, ensuring legitimate users are not censored by heuristic edge cases.
