# State - Trip Lifecycle

Source instance: **Trip Lifecycle and Cancellation** (introduced in CH02, `Part2/code/src/domain/booking/`).

## Participants
- `TripState` - state interface with one method per event: `accept`, `complete`, `cancel`, `reject`, `expire`.
  Each method returns the next state or raises `INVALID_TRANSITION`.
- Concrete states: `Pending`, `Confirmed`, and terminal states `Completed`, `Cancelled`, `Rejected`, `Expired`.
- `Trip` - context. Starts in `PENDING`, delegates every event to its current state object and replaces the state
  with the returned one.

## Transition table
| current | accept | complete | cancel | reject | expire |
|---|---|---|---|---|---|
| PENDING | CONFIRMED | error | CANCELLED | REJECTED | EXPIRED |
| CONFIRMED | error | COMPLETED | CANCELLED | REJECTED | error |
| COMPLETED / CANCELLED / REJECTED / EXPIRED | error | error | error | error | error |

On an error the state does not change.

## Fixture runner
Start a new `Trip`, apply the events in order, count the events that raised `INVALID_TRANSITION`
(processing continues after an error), then report the final state and the error count.

## Fixtures (identical in all four languages)
| id | events | final state | errors |
|---|---|---|---:|
| T1 | accept, complete | COMPLETED | 0 |
| T2 | cancel | CANCELLED | 0 |
| T3 | accept, cancel | CANCELLED | 0 |
| T4 | expire | EXPIRED | 0 |
| T5 | complete | PENDING | 1 |
| T6 | accept, complete, cancel | COMPLETED | 1 |
| T7 | accept, reject | REJECTED | 0 |
| T8 | expire, accept, cancel | EXPIRED | 2 |
