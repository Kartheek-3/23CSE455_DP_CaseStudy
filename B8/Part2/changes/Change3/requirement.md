# Change3: Attendance notifications

## Requirement
Members are notified when their attendance is recorded, when they reach an attendance streak,
and when they miss a booked class. Their assigned trainer is alerted about missed classes and
streaks. Members can see notifications in the app and turn email/SMS attendance alerts off.

## What was implemented
- **Backend**
  - `services/attendance_events.py` (new): attendance events (`attendance_marked`,
    `streak_milestone` at 3/7/14/30 days, `class_missed`), a publisher, and four observers:
    in-app notification, email, SMS (only if the member opted in to SMS), and an alert to the
    member's assigned trainer (from Change2). Email and SMS respect the new `attendance_alerts`
    setting and are sent in the background; their records are updated to `sent` or `failed`.
  - Attendance routes: QR scan and manual marking publish events; streak calculation moved into
    a shared helper; new `POST /api/attendance/classes/{id}/close` (trainer or admin, only after
    the class has started) marks remaining bookings as no-shows and publishes `class_missed`.
  - Notifications routes: `channel` and `unread_only` filters, `GET /unread-count`,
    `PUT /{id}/read`, `PUT /read-all`; `attendance_alerts` in the settings.
  - Models: `Notification.is_read`, `User.attendance_alerts`.
- **Frontend**
  - `NotificationsService` now keeps the unread count and latest notifications as observable
    state and polls every 30 seconds while a user is logged in.
  - App shell: ALERTS button with unread badge and a notification panel (mark read, mark all
    read, email/SMS alerts toggle).
  - Attendance page: "Close class & mark no-shows" button; `AttendanceService.closeClass()`.

## Design pattern
- **Observer (backend)**: `AttendancePublisher` (subject) with `subscribe`/`notify`;
  `AttendanceObserver.update(event, db, background_tasks)` implemented by the four observers.
  The attendance routes only publish events and do not know who is notified.
- **Observer (frontend, RxJS)**: `NotificationsService` publishes state through
  `BehaviorSubject`s; `AppComponent` observes them with the async pipe and observes
  `AuthService.currentUser$` to start or stop polling.
- **Singleton**: `NotificationsService` (`providedIn: 'root'`) gets its first consumer.
- Why: a new channel (for example push notifications) is one new observer, with no change to
  the attendance routes.

## Acceptance criteria
1. Marking attendance creates an in-app notification; a 3-day streak adds a milestone
   notification for the member and an alert for their trainer.
2. Closing a class before it starts is rejected (400); members cannot close classes (403).
3. Closing a class marks booked members as no-shows once, and notifies them and their trainer.
4. Users can mark their own notifications read (one or all) but not someone else's (404).
5. With attendance alerts turned off, no email is sent but the in-app notification still appears.
6. The streak endpoint still returns the same result after the refactor.

## Files
- `change3.diff`: unified diff from the code after Change2.
- `test_result.txt`: test output.
