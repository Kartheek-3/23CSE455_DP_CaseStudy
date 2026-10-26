# Change 3 (CH03): Pattern Effects and Refactoring Report

## 1. Executive Summary of Pattern Impact
In **Change 3 (CH03)**, Misskey's architectural foundation was extended to support context-aware link safety, homograph spoofing detection, SSRF destination protection, reputation intelligence, and promotional spam pattern analysis.

The implementation seamlessly integrates with Misskey's existing NestJS dependency injection container, TypeORM repositories, and REST API endpoint factories, while introducing a new **Strategy Pattern** for link reputation providers and refactoring URL normalization and destination validation to eliminate primitive obsession and scattered parsing code smells.

---

## 2. Detailed Pattern Collaborations Affected

### 2.1 Dependency Injection (Creational)
- **Instance Name**: `NestJS DI Container`
- **Pattern Type**: Creational
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `GlobalModule`, `CoreModule`, `di-symbols.ts`, existing domain services (`EventService`, `AudioTranscriptService`, `NoteCreateService`, etc.).
  - *After*: Added `LinkSafetyService` as an injectable provider in `packages/backend/src/core/CoreModule.ts` and `flaggedLinksRepository` in `packages/backend/src/di-symbols.ts`.
- **Reason for Change**: Decouples link security evaluation and spam frequency tracking from specific database repositories, ID generators, and endpoint transport layers.
- **Source Evidence**:
  - `packages/backend/src/di-symbols.ts`: added `flaggedLinksRepository: Symbol('flaggedLinksRepository')`.
  - `packages/backend/src/core/CoreModule.ts`: registered `LinkSafetyService` and provider alias `$LinkSafetyService`.

### 2.2 Repository Pattern (Structural)
- **Instance Name**: `TypeORM Repository Providers`
- **Pattern Type**: Structural
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `RepositoryModule.ts`, `postgres.ts`, `_.ts` defining entity repositories.
  - *After*: Added `MiFlaggedLink` entity and registered `FlaggedLinksRepository` provider.
- **Reason for Change**: Decouples audit log queries, security flagging metadata, resolution status, and relations from SQL queries and underlying database drivers.
- **Source Evidence**:
  - `packages/backend/src/models/FlaggedLink.ts`: definition of `MiFlaggedLink`.
  - `packages/backend/src/models/RepositoryModule.ts`: factory provider `$flaggedLinksRepository`.
  - `packages/backend/src/postgres.ts`: added `MiFlaggedLink` to TypeORM entities list.

### 2.3 Factory Pattern (Creational)
- **Instance Name**: `REST API Endpoint Factory`
- **Pattern Type**: Creational
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `Endpoint` base class in `endpoint-base.ts`.
  - *After*: 3 new endpoints subclassing `Endpoint`: `links/check`, `admin/links/flagged`, and `admin/links/rules/update`.
- **Reason for Change**: Enforces standardized input validation, Ajv JSON Schema compilation, rate limiting, and role-based permissions (`requireAdmin`, `requireModerator`).
- **Source Evidence**:
  - `packages/backend/src/server/api/endpoints/links/check.ts`
  - `packages/backend/src/server/api/endpoints/admin/links/flagged.ts`
  - `packages/backend/src/server/api/endpoints/admin/links/rules/update.ts`
  - `packages/backend/src/server/api/endpoint-list.ts`: registered under `links/*` and `admin/links/*`.

### 2.4 Strategy Pattern (Behavioral)
- **Instance Name**: `Link Reputation Provider Strategies`
- **Pattern Type**: Behavioral
- **Status After Change**: `newly_introduced`
- **Participants**:
  - Strategy Interface: `LinkReputationProvider` (`classify(target: NormalizedUrl): Promise<LinkReputationResult>`)
  - Concrete Strategies:
    - `LocalListReputationProvider`: evaluates instance allowlists, blocklists, and known URL shorteners.
    - `MockReputationProvider`: deterministic fixture for isolated automated testing and simulation of network timeouts.
    - `DisabledReputationProvider`: deactivates remote reputation lookups gracefully.
  - Context: `LinkSafetyService`
- **Reason for Change**: Decouples link threat analysis from paid third-party threat intelligence APIs, enabling offline testing, self-hosted deployments, and dynamic swapping of reputation sources.
- **Source Evidence**:
  - `packages/backend/src/core/security/LinkReputationProvider.ts`: interface definition and strategy implementations.
  - `packages/backend/src/core/security/LinkSafetyService.ts`: `setProvider()`, `getProvider()`, and dynamic classification dispatching.

### 2.5 Proxy Pattern (Structural)
- **Instance Name**: `Outbound HTTP SSRF Guard Proxy`
- **Pattern Type**: Structural
- **Status After Change**: `preserved`
- **Participants**:
  - `HttpRequestServiceAgent`, `HttpsRequestServiceAgent`, `net.Socket`.
- **Analysis**: Preserved without modification. `LinkSafetyService` introduces direct destination address validation (`validateDestinationSafety`) that adheres to identical non-unicast address constraints (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `100.64.0.0/10`, `224.0.0.0/4`, `::1`, `::ffff:127.0.0.1`, `localhost`, `.local`) without making speculative external network calls.

---

## 3. Code Smell Identification and Refactoring

### 3.1 Code Smell: *Primitive Obsession & Scattered Ad-Hoc URL Validation*
- **Observation**: Prior to CH03, URL checks across link previews, markdown parsing, and mention extraction treated URLs as raw strings, often relying on simplistic regular expressions. This exposed the application to edge cases such as trailing dots (`example.com.`), explicit default ports (`:80`, `:443`), userinfo spoofing (`user:pass@example.com`), and Punycode confusable domains (`xn--...`).
- **Refactoring Applied**: Introduced a centralized, cohesive `normalizeUrl` pipeline and `validateDestinationSafety` method in `LinkSafetyService`:
  1. Parses raw strings through WHATWG `URL` and converts hostnames to lowercase with trailing dots stripped.
  2. Normalizes default ports to prevent cache-splitting.
  3. Decodes Punycode labels using standard Unicode transformation to inspect actual character skeletons.
  4. Inspects user credentials preceding hostnames to detect phishing obfuscation.
  5. Validates raw and parsed IP addresses via `ipaddr.js` to strictly reject non-unicast destinations.
- **Outcome**: Centralizes URL security logic, prevents duplicate parsing bugs, and provides a single, testable foundation for link safety across the backend and frontend.
