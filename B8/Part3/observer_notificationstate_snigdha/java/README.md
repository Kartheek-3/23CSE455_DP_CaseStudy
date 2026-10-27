# Observer – Notification State (Java)

## Purpose
This Java example represents the `Notification state observer (RxJS)` instance in the project's pattern-evolution CSV. The original frontend uses RxJS `BehaviorSubject` streams in `NotificationsService`; `AppComponent` observes the unread count and latest notification and updates the notification badge/panel.

## Pattern roles
- **Subject:** `NotificationsSubject`
- **Observer interface:** `NotificationObserver`
- **Concrete observer:** `NotificationPanel` (represents the app header's notification badge/panel)
- **Producers/actions:** publishing a notification, marking one read, and marking all read

## Behaviour
The subject stores the latest notification and unread count. When either changes, it notifies subscribers. On subscription, it immediately sends the current values, mirroring the initial-value behaviour of an RxJS `BehaviorSubject`. Unsubscribed observers no longer receive updates.

## Files
- `java/NotificationStateObserver.java` – pattern implementation.
- `java/NotificationStateObserverTest.java` – executable test runner.

## Run
Requires a JDK (Java 8 or later). From this `java` directory:

```bash
javac NotificationStateObserver.java NotificationStateObserverTest.java
java NotificationStateObserverTest
```

Expected output:

```text
All NotificationStateObserver tests passed.
```

## Cross-language note
RxJS is a JavaScript library, so this Java version does not use RxJS itself. It translates the same Subject/Observer state-notification behaviour into plain Java interfaces and subscriber registration. It is a standalone pattern demonstration, not a connection to the Angular application.
