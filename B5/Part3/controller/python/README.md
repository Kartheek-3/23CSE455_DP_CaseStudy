# P03 — Controller (GRASP): Trip Creation Coordination — Python

Confirmed DaPlanStan source instance **P03**; cross-language small-problem implementation.

## Pattern roles

- **System event:** create-trip request from the fixture runner.
- **GRASP Controller:** `TripCreationController.create` receives the event, validates inputs, coordinates collaborators and returns an outcome.
- **Domain object:** `Trip` stores an ID, trimmed title and validated dates.
- **Account/owner context:** `Account` stores the authenticated user/traveler IDs and resulting memberships.
- **Membership entity:** `TripMember` stores the initial `owner` role.
- **Persistence collaborator:** `TripStore` is an in-memory trip collection.
- **Follow-up collaborator:** `CoverTaskQueue` holds a simulated cover-image queue entry.
- **Client:** the test runner passes each source request **to the Controller**, not directly to the collaborator objects.

Trip and TripMember are frozen dataclasses; Account stores memberships; TripStore and CoverTaskQueue hold local lists.

This represents GRASP Controller because the system-event coordinator delegates to domain collaborators. The pattern is not established by naming a function `main` or by doing all domain work inside the runner.

## Commands

Working directory: `Part3/controller/python` from the extracted ZIP.

Compile: `None (interpreted)`

Test: `python3 test_main.py`

Actual runtime/compiler: `Python 3.13.5`.

Each test runner reads `../../common_specs/controller_cases.tsv` and `../../common_specs/controller_expected.tsv`, checks all eight exact TSV output rows, and separately checks one Trip, one owner TripMember, one cover task on success or zero mutations on failure.

## Simplifications and boundaries

No Rails application, persistent database, image API, network request or external cover worker is used. Side effects are in-memory only. All validation completes before any side effect; a real database transaction and failures while scheduling jobs are out of scope. Cross-language date validation is strict Gregorian, and error strings use controlled fixture codes. This exercise does not prove the full DaPlanStan Rails application runs.

## Verified results

- Fixture cases: **8/8 passed**, 0 failures, 0 errors, 0 skips; exit 0.
- Production LOC: **59** (excluding tests, comments, blank lines and fixtures).
- Maximum function CC: **10** (Strategy/Observer frozen McCabe-style rule).
- Median fresh-process execution: **818.330142 ms** from five measured runs after one warm-up.
- Source code: `main.py`; test source: `test_main.py`.
- Raw outputs in `test_result.txt` and `timings.csv`; compilation/timing record in `Part3/evidence/controller_*.json`.

Process measurements include startup, reading input/expected fixtures, creation/error handling, side-effect assertions and output; they are not pure Controller algorithm benchmarks.
