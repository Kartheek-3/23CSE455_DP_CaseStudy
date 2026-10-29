# Change 1 (CH01): Pattern Effects and Refactoring Report

## 1. Executive Summary of Pattern Impact

In **Change 1 (CH01)**, Misskey's architectural foundation was extended to support first-class native events, attendance state management, and scheduled notification reminders. The implementation adheres to established repository patterns without creating parallel architectures, while introducing targeted refactoring to avoid code smells.

---

## 2. Detailed Pattern Collaborations Affected

### 2.1 Dependency Injection (Creational)
- **Instance Name**: `NestJS DI Container`
- **Pattern Type**: Creational
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `GlobalModule`, `CoreModule`, `di-symbols.ts`, existing domain services (`NoteCreateService`, `NotificationService`, etc.).
  - *After*: Added `EventService` as an injectable service in `packages/backend/src/core/CoreModule.ts` and `di-symbols.ts` (`eventsRepository`, `eventRsvpsRepository`).
- **Reason for Change**: Enables `EventService` to receive repositories, `IdService`, and `NotificationService` via constructor injection, maintaining loose coupling and full testability.
- **Source Evidence**:
  - `packages/backend/src/di-symbols.ts`: added `eventsRepository: Symbol('eventsRepository')`, `eventRsvpsRepository: Symbol('eventRsvpsRepository')`.
  - `packages/backend/src/core/CoreModule.ts`: imported and registered `EventService` and `$EventService`.

### 2.2 Repository Pattern (Structural)
- **Instance Name**: `TypeORM Repository Providers`
- **Pattern Type**: Structural
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `RepositoryModule.ts`, `postgres.ts`, `_.ts` defining entity repositories for Notes, Users, Channels, etc.
  - *After*: Added `MiEvent` and `MiEventRsvp` entities, and provided `EventsRepository` and `EventRsvpsRepository`.
- **Reason for Change**: Abstracts database queries, primary key lookups, and transactional operations away from business logic.
- **Source Evidence**:
  - `packages/backend/src/models/Event.ts`: definition of `MiEvent`.
  - `packages/backend/src/models/EventRsvp.ts`: definition of `MiEventRsvp`.
  - `packages/backend/src/models/RepositoryModule.ts`: factory providers `$eventsRepository` and `$eventRsvpsRepository`.

### 2.3 Factory Pattern (Creational)
- **Instance Name**: `REST API Endpoint Factory`
- **Pattern Type**: Creational
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `Endpoint` base class in `endpoint-base.ts`, compiling Ajv JSON schemas into callable endpoint closures.
  - *After*: 6 new endpoints subclassing `Endpoint`: `events/create`, `events/show`, `events/update`, `events/cancel`, `events/rsvp`, `events/rsvps`.
- **Reason for Change**: Enforces consistent API validation, parameter coercion, error responses, and role/credential checks.
- **Source Evidence**:
  - `packages/backend/src/server/api/endpoints/events/*.ts`: endpoint definitions with `meta`, `paramDef`, and `super(meta, paramDef, ...)`.
  - `packages/backend/src/server/api/endpoint-list.ts`: registered under `events/*`.

### 2.4 Observer / Pub-Sub Pattern (Behavioral)
- **Instance Name**: `Notification Event Dispatcher`
- **Pattern Type**: Behavioral
- **Status After Change**: `extended`
- **Participants**:
  - *Before*: `NotificationService` and `Notification.ts` managing `note`, `reaction`, `follow`, etc.
  - *After*: Extended `MiNotification` union with `eventReminder`, `eventRsvp`, `eventUpdated`, and `eventCancelled`.
- **Reason for Change**: Event lifecycle transitions and reminders notify subscribers asynchronously through Misskey's notification timeline without coupling the event service to notification transport.
- **Source Evidence**:
  - `packages/backend/src/models/Notification.ts`: added event notification payload interfaces.
  - `packages/backend/src/core/EventService.ts`: calls to `this.notificationService.createNotification(...)`.

### 2.5 State Pattern (Behavioral)
- **Instance Name**: `RSVP Attendance State Machine`
- **Pattern Type**: Behavioral
- **Status After Change**: `newly_introduced`
- **Participants**: `EventRsvpStatus` (`going`, `interested`, `not_going`), transition handler in `EventService.rsvp()`.
- **Reason for Change**: Enforces valid attendance states, ensures user state transitions update existing records idempotently, and prevents RSVP mutations on cancelled or ended events.
- **Source Evidence**:
  - `packages/backend/src/models/EventRsvp.ts`: strict union type `EventRsvpStatus`.
  - `packages/backend/src/core/EventService.ts:300-345`: transition logic ensuring exactly 1 active state per `(eventId, userId)`.

---

## 3. Code Smell Addressed & Refactoring Performed

### 3.1 Code Smell: Primitive Obsession & Feature Envy in Date/Time Calculations
- **Problem**: When computing reminders, developers often scatter raw timestamp arithmetic (`date.getTime() - 15 * 60 * 1000`), local time parsing, and boolean comparisons across multiple controller and service methods. This leads to subtle bugs (e.g., negative delays, wall-clock vs UTC confusion, duplicate reminder jobs on reschedule).
- **Refactoring Applied**: **Introduce Value Object / Extract Class** (`EventReminderSchedule`).
- **Implementation**:
  ```typescript
  export class EventReminderSchedule {
      public static readonly DEFAULT_LEAD_TIME_MS = 15 * 60 * 1000; // 15 minutes

      public readonly reminderAt: Date;
      public readonly delayMs: number;
      public readonly isEligible: boolean;

      constructor(startsAt: Date, now: Date = new Date(), leadTimeMs: number = EventReminderSchedule.DEFAULT_LEAD_TIME_MS) {
          const targetTime = startsAt.getTime() - leadTimeMs;
          this.reminderAt = new Date(targetTime);
          this.delayMs = targetTime - now.getTime();
          this.isEligible = this.delayMs > 0;
      }
  }
  ```
- **Benefits**:
  - Centralizes reminder lead-time rules (15 minutes).
  - Explicitly encapsulates validity and eligibility invariants (`isEligible`).
  - Unit tests verify the Value Object directly (Tests 13 & 14) and through service operations (Tests 8 & 16).

---

## 4. Test Evidence Supporting Behaviour & Invariant Preservation
All 21 focused unit tests executed in `packages/backend/test/unit/EventService.test.ts` passed:
- **Validation**: Tests 1-4 verify title bounds, IANA timezones, URL sanitization, and time ordering.
- **Authorisation & Lifecycle**: Tests 5-8 verify creator-only permissions, cancellation immutability, and rescheduling updates.
- **State Invariants**: Tests 9-12 verify single-record RSVP uniqueness, state replacements, and attendance count aggregates.
- **Idempotency & Deduplication**: Tests 15, 16, 18, 21 verify that duplicate executions or retries never emit duplicate notifications or reminders.
