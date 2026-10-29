# CH02 - Ride cancellation

Owner: M Kumar (AM.SC.U4CSE23134). Commit `28a83c8776feff6acc2727c48306ffae825a2f7f` (parent: CH01 `f635355`).

## Requirement (user story)
As a **rider or driver** I want to **cancel a ride I am part of**, with a clear fee rule, so that plans can change without
breaking the trip lifecycle.

## Acceptance criteria
1. Only PENDING or CONFIRMED rides can be cancelled; COMPLETED, CANCELLED, REJECTED and EXPIRED return 409 and nothing is saved.
2. Only the rider of the booking (`PATCH /api/users/booking/cancel`) or its assigned driver
   (`PATCH /api/drivers/booking/cancel`, new) may cancel it (403 otherwise).
3. Rider fee: 0 while PENDING or before 21:00 IST on the day before the ride; afterwards max(Rs 50, 10% of the estimated
   fare). Driver cancellation: fee 0.
4. The booking stores `cancelledBy` and `cancellationFee`; the response returns `{bookingId, status, cancellationFee}`.
5. Rider cancels -> assigned driver gets `cancel:booking`; driver cancels -> rider gets `booking:cancelledByDriver` (new);
   unaccepted broadcast -> drivers get `booking:assigned` so the request popup disappears.
6. Driver status updates (`PATCH /booking-status/:id`) follow the same state rules; CANCELLED must use the cancel endpoint.

## Design
- **State** - `src/domain/booking/TripState.ts`: `TripState`, `BaseTripState`, `PendingTrip`, `ConfirmedTrip`, `FinishedTrip`;
  context `TripLifecycle.apply(event)` / `moveTo(status)`; used by `CancelBooking`, `UpdateBookingStatus`, `CronScheduler`.
- **Strategy** - `src/domain/booking/CancellationPolicy.ts`: `CancellationPolicy`, `RiderCancellationPolicy`,
  `DriverCancellationPolicy`, selected by `cancellationPolicyFor(cancelledBy)`.
UML: `Part2/diagrams/ch02_trip_state_cancellation.png`.

## Pattern effects
| Instance | Status | Reason |
|---|---|---|
| Trip Lifecycle and Cancellation (State) | newly_introduced | replaces scattered status checks; fixes cancel-after-complete |
| Cancellation Fee Policy (Strategy) | newly_introduced | fee rule varies by who cancels |
| Socket.IO Ride Notification Adapter | extended | new target operation `driverCancelledBookingNotification` |
| Ride Event Notification (Observer) | extended | new event to riders; popup dismissal on cancel |
| Authenticated Ride Request Pipeline (CoR) | extended | new driver route chain |
| Async Controller Error Forwarding (Decorator) | extended | new wrapped handler `driverCancelBooking` |
| Trip Booking Repository | extended | persists `cancelledBy`, `cancellationFee` |

## Refactoring
- **Smells:** the controller forced `status: CANCELLED` into the use case (data clump / misleading parameter); the 9 PM cutoff
  arithmetic lived inside the use case; no guard on the current status (defect proven by the baseline test
  "a COMPLETED trip can still be cancelled"); no ownership check.
- **Techniques:** Replace Conditional with State; Extract Class (cutoff + fee rule -> `RiderCancellationPolicy`);
  Replace Parameter with explicit intent (`cancelledBy`, `actorId`).
- **Behaviour preservation:** the two baseline cancellation tests keep their expectations (only the input shape changed);
  the cutoff instant is pinned by test "cutoff is 21:00 IST (15:30 UTC) on the previous day".

## Tests
`npm test` at the commit: **33/33 passed** (`test_results.txt`); new `tests/cancellation.test.ts` (11 tests, including
fixtures T1-T8 shared with Part 3). `tsc --noEmit`: 7 errors, identical to the baseline.

## Metrics (tools/ts_metrics.js)
| File | NLOC before -> after | max CC before -> after |
|---|---|---|
| `CancelBooking.ts` | 48 -> 48 | 5 -> 9 |
| `UpdateBookingstatus.ts` | 54 -> 64 (incl. CH03) | 12 -> 12 |
| `CronScheduler.ts` | 44 -> 45 | 5 -> 5 |
| `domain/booking/TripState.ts` (new) | - -> 114 | - -> 4 |
| `domain/booking/CancellationPolicy.ts` (new) | - -> 37 | - -> 4 |

`CancelBooking.execute` gained branches for ownership and for choosing the notification recipient, so its CC rose although
the status logic left it; more LOC overall is the price of explicit states, not proof of better design.

Files: `ride_cancellation.patch`, `diffstat.txt`, `test_results.txt`.
