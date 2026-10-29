# CH01 - New driver status (SUSPENDED)

Owner: Sai Sameer (AM.SC.U4CSE23326). Commit `f6353555bedbe0a9bcd083b4967ce7699498c027` (parent: harness `168ef00`).

## Requirement (user story)
As an **admin** I want to **temporarily suspend an approved driver** (with a reason) and later **reinstate** them, so that a
driver under investigation stops getting rides without deleting or blocking the account.

## Acceptance criteria
1. `PUT /api/admin/driver/status/:driverId` accepts `suspended`; a reason is required (422 otherwise).
2. Only these transitions are legal: pending->approved, pending->rejected, approved->suspended, suspended->approved,
   suspended->rejected, rejected->pending. Anything else returns 409 and nothing is saved or sent.
3. A suspended driver is not matched (geo query already requires `status: 'approved'`), cannot accept a booking (403),
   cannot be requested directly by a rider (400), gets no catch-up requests on `driver:online`, and cannot log in (403).
4. The driver receives `admin:changeDriverStatus` with the new status and reason.

## Design
State pattern - `src/domain/driver/DriverAccountState.ts`: `DriverAccountState` interface, `BaseDriverAccountState` (refuses
by default), `PendingDriverState`, `ApprovedDriverState`, `RejectedDriverState`, `SuspendedDriverState`; context
`DriverAccount.changeTo()` / `canReceiveRides()`. UML: `Part2/diagrams/ch01_driver_account_state.png`.

## Pattern effects
| Instance | Status | Reason |
|---|---|---|
| Driver Account Lifecycle (State) | newly_introduced | replaces any-to-any status update checked by `includes()` |
| Driver Repository with Geospatial Matching Query | modified | `updateStatus` takes `DriverAccountStatus`, stores suspension reason |
| Trip Booking Repository | extended | new `acceptPendingBooking` (see refactoring) |
| Ride Event Notification (Observer) | modified | catch-up skips drivers that cannot take rides; notify only after a legal change |
| Ride Booking Request Flow (Layered) | modified | application layer no longer imports a Mongoose model |
| Use-Case and Service Composition Root (DI) | extended | `AcceptBooking` injects `IDRIVER_REPO` |

## Refactoring
- **Smell:** `AcceptBooking` (application layer) imported `BookingModel` and ran `findOneAndUpdate` itself - a layering
  violation that also made the use case untestable without MongoDB.
- **Technique:** Move Method into the repository (`IBookingRepository.acceptPendingBooking`, implemented in
  `MongoBookingRepository` with the identical atomic query and populate).
- **Behaviour preservation:** test "approved driver accepts a PENDING booking through the repository" checks the
  CONFIRMED result, the two notifications in the original order, and that a second driver gets "no longer available".

## Tests
`npm test` at the commit: **22/22 passed** (`test_results.txt`). New file `tests/driverStatus.test.ts` (9 tests). The baseline
defect test "an admin can move a rejected driver straight to approved" was replaced by a test that the move is refused.
`tsc --noEmit`: 7 errors, identical to the baseline.

## Metrics (tools/ts_metrics.js, same scope before/after)
| File | NLOC before -> after | max CC before -> after |
|---|---|---|
| `AdminChangeDriverStatus.ts` | 31 -> 32 | 5 -> 3 |
| `AcceptBooking.ts` | 42 -> 58 | 4 -> 6 |
| `domain/driver/DriverAccountState.ts` (new) | - -> 135 | - -> 6 |

The admin use case is simpler (validation moved into states); `AcceptBooking` grew because it now checks the driver's state.

Files: `new_driver_status.patch`, `diffstat.txt`, `test_results.txt`.
