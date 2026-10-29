# Change 3 — test_result

`jest_change3.txt` — real Jest output.

Command: `npx jest --runInBand --testPathPatterns "occupancy"`
Result: 1 suite passed, 5 tests passed.

Covers: observer attach/detach counting, notification of all observers, occupied/
available status tracking, detached observers stop receiving events, and a plain
mock observer.
