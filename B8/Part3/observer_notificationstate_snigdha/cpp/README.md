# Observer Pattern – Notification State (C++)

## Pattern roles
- **Subject:** `NotificationsSubject`
- **Observer interface:** `NotificationObserver`
- **Concrete observer:** `NotificationPanel`

The subject maintains unread count and latest notification, then notifies registered observers whenever the state changes. A new subscriber immediately receives the current state.

## Compile and run
Requires a C++11-or-later compiler.

```bash
g++ -std=c++11 -Wall -Wextra NotificationStateObserverTest.cpp -o observer_test
./observer_test
```

On Windows PowerShell, run `.\observer_test.exe` after compiling.

## Note
Standalone educational implementation of the RxJS-style observer behavior. It is not connected to Angular or the Gym Management System runtime.
