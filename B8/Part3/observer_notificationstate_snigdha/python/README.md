# Observer Pattern – Notification State (Python)

## Purpose
The Observer pattern keeps subscribers informed whenever notification state changes.

## Pattern roles
- **Subject:** `NotificationsSubject`
- **Observer contract:** callable receiving a `NotificationState`
- **Concrete observer:** `NotificationPanel`

The subject stores the unread count and latest notification. Subscribing observers immediately receive the current state, similar to RxJS `BehaviorSubject`.

## Run tests
Requires Python 3.8+; no third-party packages are needed.

```bash
python -m unittest -v
```

Run the command from this `python` folder.

## Note
This is a standalone Python adaptation of the RxJS state-observer behavior. It is not connected to Angular or the Gym Management System runtime.
