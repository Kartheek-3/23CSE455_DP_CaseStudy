# P03 — Controller (GRASP): Trip Creation Coordination — C++

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

Account owns member records. Domain structs store data, and queue/store are separate collaborators. Compiled executable is omitted from the ZIP.

This represents GRASP Controller because the system-event coordinator delegates to domain collaborators. The pattern is not established by naming a function `main` or by doing all domain work inside the runner.

## Commands

Working directory: `Part3/controller/cpp` from the extracted ZIP.

Compile: `g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o controller_tests`

Test: `./controller_tests`

Actual runtime/compiler: `g++ (Debian 14.2.0-19) 14.2.0, C++17`.

Each test runner reads `../../common_specs/controller_cases.tsv` and `../../common_specs/controller_expected.tsv`, checks all eight exact TSV output rows, and separately checks one Trip, one owner TripMember, one cover task on success or zero mutations on failure.

## Simplifications and boundaries

No Rails application, persistent database, image API, network request or external cover worker is used. Side effects are in-memory only. All validation completes before any side effect; a real database transaction and failures while scheduling jobs are out of scope. Cross-language date validation is strict Gregorian, and error strings use controlled fixture codes. This exercise does not prove the full DaPlanStan Rails application runs.

## Verified results

- Fixture cases: **8/8 passed**, 0 failures, 0 errors, 0 skips; exit 0.
- Production LOC: **90** (excluding tests, comments, blank lines and fixtures).
- Maximum function CC: **13** (Strategy/Observer frozen McCabe-style rule).
- Median fresh-process execution: **2.565644 ms** from five measured runs after one warm-up.
- Source code: `main.hpp and main.cpp`; test source: `test_main.cpp`.
- Raw outputs in `test_result.txt` and `timings.csv`; compilation/timing record in `Part3/evidence/controller_*.json`.

Process measurements include startup, reading input/expected fixtures, creation/error handling, side-effect assertions and output; they are not pure Controller algorithm benchmarks.
