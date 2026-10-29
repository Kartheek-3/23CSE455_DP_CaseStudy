# Change 1 — test_result

`jest_change1.txt` — real Jest output.

Command: `npx jest --runInBand --testPathPatterns "allocation"`
Result: 1 suite passed, 8 tests passed.

Covers: `FirstAvailableStrategy`, `NearestToEntranceStrategy` (including null
distance), `EvPreferredStrategy` (EV hit and fallback), `SlotAllocationContext`
dispatch and unknown-strategy fallback.
