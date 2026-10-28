# Observer Pattern – Notification State (JavaScript)

## Pattern roles
- **Subject:** `NotificationsSubject`
- **Observer contract:** callback function receiving the latest state
- **Concrete observer:** `NotificationPanel`

The subject keeps unread count and latest notification. It notifies subscribers after changes and immediately sends the current state to a new subscriber, matching the relevant BehaviorSubject-style behavior used by RxJS.

## Run tests
Requires Node.js 18+; no npm packages are required.

```bash
node notificationState.test.js
```

Run the command from this `javascript` folder.

## Note
This is a standalone JavaScript demonstration of the notification-state observer behavior, not an Angular/RxJS runtime integration.
