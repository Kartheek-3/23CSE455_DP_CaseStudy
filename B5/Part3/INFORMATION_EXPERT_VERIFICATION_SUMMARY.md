# P01 Information Expert — cross-language verification

**Source instance:** Parsed Email to Trip Record Linking; GRASP Information Expert; selected ID P01.

## Frozen fixtures

The original I01–I08 shared TSV fixtures were created and hashed before implementation. Identical input and expected output files are read by each test runner.

| Fixture | Cases | SHA-256 |
|---|---:|---|
| `common_specs/information_expert_cases.tsv` | 8 | `c12f408f1d5c3e9e19e35d3e3b5e415a9fc8af0cbef726692033115370257657` |
| `common_specs/information_expert_expected.tsv` | 8 | `6274eab668f786007555af1f19babeaef6cc8fcf9575cdaabada99f8d3775584` |

## Expert responsibility and observed state

- `InboxItem` holds parsed booking and trip identifiers, performs ASCII case-insensitive same-trip matching and decides link versus create.
- The request handler (`InboxReviewController`) invokes this responsibility; it does not choose matching behavior.
- `Trip` contains candidate `TripItem` records. Linked records are reused without creating new records, and their existing nonblank reference and inbox links are preserved.
- New records use `item-Ixx`, the current trip and inbox ID and `confirmed` status.
- Error `MISSING_PROVIDER` leaves all records unmodified. I04 tests that an item from another trip is never linked.
- All eight test runners perform object-state assertions in addition to comparing golden output rows.

## Versions, compilation and test results

| Language | Runtime/compiler version | Compile | Test command | Passed/total | Failures | Errors | Exit |
|---|---|---|---|---:|---:|---:|---:|
| Java | `openjdk version "21.0.12.1" 2026-08-18; javac 21.0.12.1` | `javac Main.java TestMain.java` | `java TestMain` | 8/8 | 0 | 0 | 0 |
| Python | `Python 3.13.5` | `not applicable` | `python3 test_main.py` | 8/8 | 0 | 0 | 0 |
| JavaScript | `Node.js v22.16.0` | `not applicable` | `node test_main.js` | 8/8 | 0 | 0 | 0 |
| C++ | `g++ (Debian 14.2.0-19) 14.2.0 C++17` | `g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o information_expert_tests` | `./information_expert_tests` | 8/8 | 0 | 0 | 0 |

All 32 language-case combinations executed successfully. Java and C++ compile commands returned exit code 0. No third-party libraries were used.

## Production-only size and function complexity

The frozen Strategy LOC/counting helpers were reused (`count_loc`, `py_functions`, `extract_brace_functions`); only language-specific function discovery was extended. Rule: base 1, plus branches, loops, case labels, exception handlers, ternaries and short-circuit decisions.

| Language | Production files | source_loc | max_function_cc | Highest-complexity function |
|---|---|---:|---:|---|
| Java | `information_expert/java/Main.java` | 63 | 7 | `linkOrCreateTripItem` |
| Python | `information_expert/python/main.py` | 45 | 7 | `InboxItem.link_or_create_trip_item` |
| JavaScript | `information_expert/javascript/main.js` | 38 | 6 | `linkOrCreateTripItem` |
| C++ | `information_expert/cpp/main.hpp, information_expert/cpp/main.cpp` | 83 | 7 | `InboxItem::linkOrCreateTripItem` |

## Fresh-process timing evidence

One successful warmup followed by five successful measured process runs per language. Timings include startup, reading both TSV files, running all eight cases, state checking and comparing output.

| Language | Warmup (ms) | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Java | 93.846054 | 75.601558 | 64.794227 | 78.340000 | 78.456998 | 56.485319 | **75.601558** |
| Python | 829.603956 | 847.285213 | 798.343934 | 814.468290 | 819.621766 | 839.151260 | **819.621766** |
| JavaScript | 42.410069 | 52.606290 | 33.741442 | 37.011172 | 36.435657 | 33.054916 | **36.435657** |
| C++ | 2.771811 | 4.390529 | 4.827389 | 4.058398 | 2.721256 | 4.929857 | **4.390529** |

## Pattern-role mapping

| Role | Java | Python | JavaScript | C++ |
|---|---|---|---|---|
| Information Expert | InboxItem | InboxItem | InboxItem | InboxItem |
| Owned responsibility | linkOrCreateTripItem | link_or_create_trip_item | linkOrCreateTripItem | linkOrCreateTripItem |
| Caller | InboxReviewController | InboxReviewController | InboxReviewController | InboxReviewController |
| Data context | Trip | Trip | Trip | Trip |
| Linked/new record | TripItem | TripItem | TripItem | TripItem |

## Limitations and safeguards

- This is a language-neutral in-memory representation of P01, not DaPlanStan/Rails testing; no actual email, network, persistence or expense handling.
- At most one candidate item per fixture. All name comparisons are ASCII only; not Unicode/cultural collation.
- Failure-state guarantees apply to the frozen validation/error scenarios, not database transaction behavior.
- LOC and McCabe-style CC are source-level heuristic measurements. Timings are machine-specific process measurements, not isolated algorithm timings.
- Earlier Strategy, Observer and Controller source, fixtures, append-ready records and evidence were hash-checked unchanged.
- No Adapter was implemented and no final `cross_language.csv` has been produced.
