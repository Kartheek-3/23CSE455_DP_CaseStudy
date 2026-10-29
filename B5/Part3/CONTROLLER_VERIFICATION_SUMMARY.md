# P03 — Controller (GRASP): Cross-Language Verification

**Selected confirmed source instance:** P03 — Trip Creation Coordination. This is a standalone simplification of DaPlanStan trip creation. It does not modify or exercise the Rails application. **Only Controller was added during this stage; Strategy and Observer remain frozen.**

## Common fixtures and rules

- `Part3/common_specs/controller_cases.tsv`: C01–C08, eight independent cases.
- `Part3/common_specs/controller_expected.tsv`: eight canonical expected output rows.
- A request must contain a user, owner traveler, trimmed nonblank title, valid strict Gregorian start/end dates and end ≥ start. Same-day trips are valid.
- Success creates exactly one Trip ID `trip-<case_id>`, exactly one `TripMember(role=owner)` and one cover-task request.
- Failure creates no trip, membership or task. Errors: `UNAUTHENTICATED`, `MISSING_OWNER`, `MISSING_TITLE`, `INVALID_DATE`, `INVALID_DATE_RANGE`.
- C05 explicitly rejects February 30; C08 trims precisely `  City Break  ` to `City Break`.
- Each language reads the same input and expected TSVs; runners compare output *and* independently inspect side effects.
- Frozen fixture SHA-256: cases `89d26a4cf16f1fdc84b1f279c637197d622f7a1f42a279153adccd86481040f2`; expected `55dc3248a0b492f4ee297bbf23eeffdc9422bae8bdf0a5e507ac165cb72544f5`.

## GRASP Controller role mapping

| Role | All four languages |
|---|---|
| System event | Create-trip request |
| Coordinator | `TripCreationController.create` |
| Domain entity | `Trip` |
| Owner/account context | `Account` |
| Membership entity | `TripMember` |
| In-memory persistence | `TripStore` |
| Simulated background task | `CoverTaskQueue` |
| Client | Fixture-driven test runner calling the Controller |

Unlike a procedural runner creating the objects itself, the Controller receives the event, validates it and coordinates all collaborators. There is no direct Rails or database dependency.

## Actual compiler/runtime and test evidence

- **Java**: `openjdk version "21.0.12.1" 2026-08-18; javac 21.0.12.1`. Compile `javac Main.java TestMain.java`; test `java TestMain` from `Part3/controller/java`. **8/8 passed; 0 failures, errors or skips; exit code 0.** LOC **66**; max function CC **9**.
- **Python**: `Python 3.13.5`. Compile `None (interpreted)`; test `python3 test_main.py` from `Part3/controller/python`. **8/8 passed; 0 failures, errors or skips; exit code 0.** LOC **59**; max function CC **10**.
- **JavaScript**: `Node.js v22.16.0`. Compile `None (interpreted)`; test `node test_main.js` from `Part3/controller/javascript`. **8/8 passed; 0 failures, errors or skips; exit code 0.** LOC **55**; max function CC **9**.
- **C++**: `g++ (Debian 14.2.0-19) 14.2.0, C++17`. Compile `g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o controller_tests`; test `./controller_tests` from `Part3/controller/cpp`. **8/8 passed; 0 failures, errors or skips; exit code 0.** LOC **90**; max function CC **13**.

## Production LOC and complexity measurement

LOC is production source only, excluding blank/comment-only lines, tests and fixtures. For C++ both `main.hpp` and `main.cpp` are included. Complexity uses the **same original Strategy measurement helpers** in `evidence/measure_complexity.py` (Python AST or balanced-brace decisions): baseline 1 per function plus if/elif, loops, switch cases, catch/except handlers, ternary decisions and short-circuit Boolean decisions. Only Controller-specific method discovery regex was added by `evidence/controller_measure_complexity.py`. Counts are approximate static McCabe-style values, not a commercial analyzer.

## Timing protocol and raw results

Compilers run *before* timings. Each language runs one warm-up, followed by exactly five fresh-process measured test executions. Every timed run reads and verifies all eight cases and must exit zero. Elapsed time uses monotonic `perf_counter_ns()` around the entire process including startup, fixture input, assertions and output. No runtime is estimated. Results are machine-specific.

| Language | Warm-up ms | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Median ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| Java | 175.664352 | 127.033536 | 160.614228 | 159.472871 | 462.170697 | 100.443311 | **159.472871** |
| Python | 989.130089 | 832.153117 | 818.330142 | 810.700920 | 806.477262 | 825.163746 | **818.330142** |
| JavaScript | 44.563490 | 30.699406 | 41.517425 | 39.392140 | 37.862085 | 35.211936 | **37.862085** |
| C++ | 2.490400 | 2.463929 | 2.565644 | 2.788841 | 3.346171 | 2.067579 | **2.565644** |

## Reproducible evidence and limitations

- `Part3/evidence/controller_environment_versions.json`, `controller_compilation_results.json`, `controller_execution_results.json`, `controller_static_metrics.json` contain observed versions, commands, exits, test/timing results and metric details.
- Each language contains `test_result.txt`, `timings.csv` and a README with exact commands.
- `controller_append_ready.json` contains exactly four records using the eleven faculty fields; **no final `cross_language.csv` was generated**.
- No database transactions, real image retrieval, Rails authentication, persistence failures or external APIs are implemented. Atomicity assertions cover the specified *validation errors* only; exceptions in external storage/queues are outside the simplified fixture scope.
- No DaPlanStan application source was edited. All Strategy/Observer code and evidence were checked against the pre-stage SHA-256 manifest.
