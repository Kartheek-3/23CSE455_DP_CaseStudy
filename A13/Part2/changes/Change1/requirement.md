# Change 1 (CH01): Native Events with RSVP and Reminder Notifications

## 1. Feature Objective
The objective of this feature is to implement a first-class, structured event-management system natively integrated into Misskey's existing architecture. This enables users to create events with temporal and location details, manage RSVP attendance intentions (`going`, `interested`, `not_going`), receive automated reminders (15 minutes before event start), and coordinate updates or cancellations with attendees.

## 2. Requirement Specification (Authoritative Prompt)
- **Event Information**:
  - Title (required, 1-128 chars, non-empty after trimming).
  - Description (optional, max 2048 chars).
  - Start date/time and end date/time (stored in UTC `timestamp with time zone`, start < end required).
  - Timezone (valid IANA timezone string verified via `Intl.DateTimeFormat`).
  - Physical location (optional, max 256 chars).
  - Online meeting URL (optional, max 512 chars, must use `http` or `https` scheme).
- **Event Sharing & Ownership**:
  - Authenticated local users can create events.
  - Creator is automatically registered as `going`.
  - Only the event creator can edit or cancel an event (`ACCESS_DENIED` enforced).
  - Cancelled events are flagged (`isCancelled = true`) and prevent further edits or reminders.
- **RSVP Functionality**:
  - Three distinct states: `going`, `interested`, `not_going`.
  - Exactly one current RSVP per user per event (`UNIQUE ("eventId", "userId")`).
  - Idempotent updates replace the existing record rather than duplicating it.
  - Creator can inspect attendance summaries (`going`, `interested`, `notGoing` counts) and attendee list.
  - RSVPs cannot be submitted for cancelled or ended events.
- **Reminder & Notification Policy**:
  - Automated reminder scheduled with a default 15-minute lead time before event start.
  - Reminder calculation uses the absolute UTC instant, not local wall clock time.
  - Past events and cancelled events never trigger reminders.
  - Rescheduling updates the reminder schedule and prevents stale reminder execution.
  - Participants with `not_going` are strictly excluded from reminder notifications.
  - Idempotency guard (`event.reminderSentAt`) ensures retried or duplicate executions dispatch no duplicate reminders.
  - RSVP changes notify the event creator (idempotent submissions do not duplicate notifications).
  - Event updates and cancellations notify affected attendees (`going` and `interested`).

## 3. Observable Acceptance Criteria
1. `events/create` returns newly created event with creator auto-enrolled as `going`.
2. Missing title, invalid time range, or invalid timezone results in `INVALID_PARAM` or specific `ApiError`.
3. `events/update` by owner succeeds; non-owners receive `ACCESS_DENIED`.
4. `events/cancel` sets `isCancelled: true` and notifies attendees with `eventCancelled`.
5. `events/rsvp` properly sets, updates, or transitions state (`going` -> `interested` -> `not_going`) without duplicates.
6. Attendance counts reflect real-time counts.
7. Reminder processing dispatches `eventReminder` only to `going`/`interested` participants and sets `reminderSentAt`.
8. Retried reminder execution dispatches 0 additional notifications.

## 4. Key Architectural Decisions
- **Domain Modeling**: Created standalone `MiEvent` and `MiEventRsvp` TypeORM entities decoupled from raw text notes.
- **Inversion of Control**: `EventService` registered as a NestJS provider in `CoreModule.ts` using custom repository injection tokens.
- **Temporal Refactoring**: Introduced `EventReminderSchedule` Value Object to encapsulate reminder lead-time calculations and eliminate Primitive Obsession.
- **Idempotency**: Stored `reminderSentAt` timestamp directly on `MiEvent` to ensure stateful, database-backed deduplication across worker retries.
- **Clean Endpoints**: Created 6 dedicated REST endpoints in `packages/backend/src/server/api/endpoints/events/` conforming to Misskey's `Endpoint` factory pattern.

## 5. Affected Misskey Modules & Source Files
- **Entities & Persistence**:
  - `packages/backend/src/models/Event.ts` (added)
  - `packages/backend/src/models/EventRsvp.ts` (added)
  - `packages/backend/src/models/_.ts` (modified)
  - `packages/backend/src/models/RepositoryModule.ts` (modified)
  - `packages/backend/src/postgres.ts` (modified)
  - `packages/backend/src/di-symbols.ts` (modified)
  - `packages/backend/migration/1785000000000-events.js` (added)
- **Domain Services & Notifications**:
  - `packages/backend/src/core/EventService.ts` (added)
  - `packages/backend/src/core/CoreModule.ts` (modified)
  - `packages/backend/src/models/Notification.ts` (modified)
- **API Endpoints**:
  - `packages/backend/src/server/api/endpoints/events/create.ts` (added)
  - `packages/backend/src/server/api/endpoints/events/show.ts` (added)
  - `packages/backend/src/server/api/endpoints/events/update.ts` (added)
  - `packages/backend/src/server/api/endpoints/events/cancel.ts` (added)
  - `packages/backend/src/server/api/endpoints/events/rsvp.ts` (added)
  - `packages/backend/src/server/api/endpoints/events/rsvps.ts` (added)
  - `packages/backend/src/server/api/endpoint-list.ts` (modified)
- **Frontend**:
  - `packages/frontend/src/components/MkEventCard.vue` (added)
- **Automated Tests**:
  - `packages/backend/test/unit/EventService.test.ts` (added)

## 6. Assumptions and Exclusions
- **ActivityPub Federation**: Per specification, full cross-instance ActivityPub federation of event objects is explicitly out of scope for Change 1.
- **Live Infrastructure**: Unit tests rely on in-memory mock repositories and test doubles because live PostgreSQL and Redis server daemons are offline in the development environment.
