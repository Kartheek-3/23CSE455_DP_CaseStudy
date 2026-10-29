# Change 2 — test_result

`jest_change2.txt` — real Jest output.

Command: `npx jest --runInBand --testPathPatterns "charging"`
Result: 1 suite passed, 8 tests passed.

Covers: the idle -> plugged-in -> charging -> completed -> idle lifecycle,
energy accumulation, illegal transitions, unplug-while-charging, and
`ChargingService` open/apply/get behaviour.
