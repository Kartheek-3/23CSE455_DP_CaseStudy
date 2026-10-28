# Observer - Ride Event Notification

Source instance: **Ride Event Notification** (baseline `SocketNotificationService` + Socket.IO + Redis socket
registry, extended in CH01/CH02). The registry `driver:socket:<id> -> socketId` is the subscription list; emitting
to a socket is the update call.

## Participants
- `Observer` - interface with `update(event)`; `event = { type: string, bookingId: string }`.
- `RecordingObserver` - concrete observer that stores the events it receives (stands in for a connected socket).
- `NotificationHub` - subject:
  - `subscribe(id, observer)` - registers or **replaces** the observer for `id` (a reconnect overwrites the old socket).
  - `unsubscribe(id)` - removes `id` (disconnect).
  - `notify(id, event) -> bool` - delivers to `id` if subscribed; returns whether it was delivered.
  - `broadcast(ids, event) -> int` - delivers to every subscribed id in `ids`; returns the delivered count.
    Unknown ids are skipped silently.

## Fixtures (each case starts with a new hub; identical in all four languages)
| id | steps | expected |
|---|---|---|
| O1 | subscribe d1, d2; broadcast [d1, d2, d3] `booking:new/B1` | returns 2; d1 has 1 event; d2 has 1 event |
| O2 | subscribe d1, d2; unsubscribe d1; broadcast [d1, d2] `booking:new/B2` | returns 1; d1 has 0 events |
| O3 | notify r1 `booking:confirmation/B3` (r1 never subscribed) | returns false |
| O4 | subscribe d1 with A; subscribe d1 with B; notify d1 `cancel:booking/B4` | returns true; A has 0 events; B has 1 |
| O5 | subscribe d2; notify d2 `booking:new/B5`; notify d2 `cancel:booking/B5` | d2 event types in order: booking:new, cancel:booking |
| O6 | subscribe r1; notify r1 `booking:confirmation/B6`; broadcast [] `booking:new/B7` | notify returns true; broadcast returns 0 |
