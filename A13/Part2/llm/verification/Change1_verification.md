# Change 1 (CH01) Verification Report

## 1. Executive Summary
- **Feature**: Native Events with RSVP and Reminder Notifications in Misskey
- **Baseline Commit**: `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- **Implementation Commit**: `608b45de20dce0a78459025320bfdeb0c4e47a78`
- **Execution Date**: 2026-10-11
- **Working Tree**: Clean (`git status --porcelain` is empty)

---

## 2. Claims Verification Matrix

| Claim # | Claim Description | Target Source Location | Verification Method | Status | Notes / Limitations |
|---|---|---|---|---|---|
| **C-01** | Event data persistence model exists with required schema fields (title, description, startsAt, endsAt, timezone, location, meetingUrl, isCancelled) | `packages/backend/src/models/Event.ts`, `packages/backend/migration/1785000000000-events.js` | Source inspection, TypeORM metadata | **CORRECT** | Confirmed entity properties, column definitions, and migration operations match requirements. |
| **C-02** | Structured RSVP data persistence exists with single active response per user per event | `packages/backend/src/models/EventRsvp.ts`, `packages/backend/migration/1785000000000-events.js` | Source inspection, Unit Tests 9-11 | **CORRECT** | Unique composite constraint `(eventId, userId)` defined in migration and entity; verified by automated tests. |
| **C-03** | Core business logic enforces validation (title length, IANA timezone, endsAt > startsAt, HTTP/HTTPS URLs) | `packages/backend/src/core/EventService.ts:70-130` | Unit Tests 1, 2, 3, 4 in `EventService.test.ts` | **CORRECT** | All 4 validation tests pass in automated CLI runner. |
| **C-04** | Authorisation permits event owners to edit/cancel and rejects non-owners | `packages/backend/src/core/EventService.ts:160-260` | Unit Tests 5, 6 in `EventService.test.ts` | **CORRECT** | Confirmed non-owners receive `PERMISSION_DENIED` errors. |
| **C-05** | Cancellation immutability: cancelling an event marks it cancelled, prevents RSVP mutation, and stops reminder | `packages/backend/src/core/EventService.ts:250-320` | Unit Tests 7, 15 in `EventService.test.ts` | **CORRECT** | Attempting RSVP on cancelled event throws `EVENT_CANCELLED`. |
| **C-06** | RSVP state transitions support going, interested, not_going and replace previous response | `packages/backend/src/core/EventService.ts:280-360` | Unit Tests 9, 10, 11, 12 in `EventService.test.ts` | **CORRECT** | Changing RSVP updates existing record in-place; summary counts reflect correct tallies. |
| **C-07** | Reminder scheduling calculates 15-minute default lead time using UTC instants via Value Object | `packages/backend/src/core/EventService.ts:35-65` (`EventReminderSchedule`) | Unit Tests 13, 14, 16 in `EventService.test.ts` | **CORRECT** | Tested both direct Value Object instantiation and service rescheduling. Past events return `isEligible = false`. |
| **C-08** | Participants with `not_going` status are excluded from reminders | `packages/backend/src/core/EventService.ts:390-415` | Unit Test 17 in `EventService.test.ts` | **CORRECT** | Verified only `going` and `interested` attendees receive reminder notifications. |
| **C-09** | Idempotency and retry protection prevent duplicate notifications | `packages/backend/src/core/EventService.ts:330-415` | Unit Tests 18, 21 in `EventService.test.ts` | **CORRECT** | Verified repeating operations or retrying delivery emits no duplicate notifications. |
| **C-10** | Endpoints are exposed via Misskey REST API framework | `packages/backend/src/server/api/endpoints/events/*.ts`, `endpoint-list.ts` | Code inspection, compilation check | **CORRECT** | 6 endpoints subclass `Endpoint` and are registered in `endpoint-list.ts`. |
| **C-11** | Frontend user interface component exists for viewing and RSVPing | `packages/frontend/src/components/MkEventCard.vue` | Code inspection, template/script verification | **CORRECT** | Provides responsive UI, badges, and RSVP action buttons. Code-level verified; visual browser rendering not independently verified in headless CLI. |
| **C-12** | Database migration execution on live PostgreSQL daemon | `packages/backend/migration/1785000000000-events.js` | Migration file check | **CANNOT BE CONFIRMED (LIVE DB)** | PostgreSQL daemon (port 54312) offline in test container; migration source and TypeORM schema verified, but live DDL execution was not performed. |
| **C-13** | ActivityPub federation of event objects to remote instances | N/A | Specification check | **NOT APPLICABLE** | Explicitly out of scope per feature specification. |

---

## 3. Automated Test Verification Details
- **Command**: `pnpm --filter backend exec vitest run test/unit/EventService.test.ts --config vitest.config.unit.ts`
- **Output**: 21 passed (21 total)
- **Exit Code**: `0`
- **Log Saved At**: `A1/Part2/changes/Change1/test_result.log`

---

## 4. Git and Commit Verification
- **Commit SHA**: `608b45de20dce0a78459025320bfdeb0c4e47a78`
- **Diffstat**: 18 files changed, 1424 insertions(+)
- **Working Tree**: Clean, verified via `git status`
- **Patch Artifact**: `A1/Part2/changes/Change1/diff.patch` matches the exact diff from baseline `5f501341d49d2bc3fa7e817ce7548a82174326eb`.
