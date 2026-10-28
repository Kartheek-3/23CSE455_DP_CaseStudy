# Part 3 — State (cross-language)

GoF State: the EV charging session lifecycle. A session delegates every event to
its current state object, and each state decides the next state.

- Context: `ChargingSession` holds the current `ChargingSessionState`.
- States: `IdleState`, `PluggedInState`, `ChargingActiveState`, `CompletedState`.
- Valid transitions: idle --plugIn--> plugged_in --startCharge--> charging
  --finishCharge--> completed --removeCable--> idle; plugged_in --removeCable--> idle.
- Invalid events are rejected by the current state and recorded (no silent change).

This is the cross-language form of the Part 2 Change 2 evolution (EV charging).
State was REJECTED at baseline in Part 1; this evolution introduces it because EV
charging is a genuine object-lifecycle problem.

Implementations (production snippet + tests in each directory):

| Language | Production | Test | Result | Median ms |
|---|---|---|---|---|
| JavaScript | `javascript/ev_charging_state.js` | `javascript/test_state.js` | 13/13 | 73.154 |
| Python | `python/ev_charging_state.py` | `python/test_state.py` | 13/13 | 67.420 |
| Java | `java/EvChargingState.java` | `java/StateTest.java` | 13/13 | 173.178 |
| C++ | `cpp/ev_charging_state.hpp` | `cpp/state_test.cpp` | 13/13 | 20.833 |

Shared test cases (identical in every language): initial state; invalid
`startCharge` from idle is rejected and does not change the state; happy path
idle→plugged_in→charging→completed; `removeCable` from plugged_in returns to
idle; `removeCable` during charging is rejected; `removeCable` from completed
returns to idle (13 assertions total).

A notable result: because the State pattern moves all conditional transition
logic into the state objects, the maximum function cyclomatic complexity of the
snippet is 1 in JavaScript, Python and Java (2 in C++ only for the manual
memory-management guard). See `../evidence/` and `data/cross_language.csv`.
