# Change 1 (CH01) Implementation Context

## 1. Baseline Repository State
- **Preceding Commit SHA**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Branch**: `develop`
- **Repository Path**: `/home/vighnesh/DP-case_study/misskey`
- **Environment**: Linux (Fedora 44, kernel 7.2.5-200.fc44.x86_64), Node.js `v22.23.1`, pnpm `11.25.0`, npm `10.9.8`, Git `2.51.0`

## 2. Relevant Source Files Inspected
- **Core Entities & Repositories**:
  - `packages/backend/src/models/_.ts` (entity and repository type mappings)
  - `packages/backend/src/models/RepositoryModule.ts` (NestJS provider registrations for repositories)
  - `packages/backend/src/postgres.ts` (TypeORM data source entity registry)
  - `packages/backend/src/models/Notification.ts` (notification entity schema and types)
  - `packages/backend/src/models/Note.ts` (note entity schema and relations)
- **Core Business Services**:
  - `packages/backend/src/core/NotificationService.ts` (notification creation and event dispatching)
  - `packages/backend/src/core/QueueService.ts` (BullMQ job queues and scheduling)
  - `packages/backend/src/core/IdService.ts` (AIDX ID generation)
  - `packages/backend/src/core/CoreModule.ts` (NestJS domain services module)
  - `packages/backend/src/di-symbols.ts` (dependency injection symbol tokens)
- **API Endpoints & Mediation**:
  - `packages/backend/src/server/api/endpoint-base.ts` (Endpoint base class with Ajv JSON Schema validation)
  - `packages/backend/src/server/api/endpoint-list.ts` (Central endpoint registration dictionary)
  - `packages/backend/src/server/api/endpoints.ts` (Endpoint meta interface definitions)
- **Database Migrations**:
  - `packages/backend/migration/` (Unix millisecond-named migration files implementing `up()` and `down()`)
- **Test Infrastructure**:
  - `packages/backend/vitest.config.unit.ts` (Vitest unit test configuration)
  - `packages/backend/test/unit/` (Unit test conventions)

## 3. Supplied Architectural Context & Constraints
- Misskey uses NestJS for Inversion of Control (IoC). Domain services must use `@Injectable()` and constructor injection tokens from `DI`.
- TypeORM provides database entities. Migrations must implement both `up(queryRunner)` and `down(queryRunner)`.
- Endpoints must declare `meta` (with `requireCredential: true`, `kind`, etc.), `paramDef` (JSON schema with Ajv validation), and an executor function.
- All new and modified files must include proper SPDX AGPL-3.0-only license headers.
- Real external PostgreSQL and Redis instances are offline in this development environment; unit and service tests must use deterministic mocks and test doubles to verify business logic, state transitions, validation, and lifecycle invariants.
