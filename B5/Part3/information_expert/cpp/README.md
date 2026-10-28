# P01 — Information Expert (GRASP): Parsed Email to Trip Record Linking

## Roles

- **Expert:** `InboxItem`, which holds inbox ID, trip ID, parsed provider name and confirmation reference and implements `linkOrCreateTripItem` (Python: `link_or_create_trip_item`).
- **Domain collection:** `Trip` with a list of `TripItem` records.
- **Domain record:** `TripItem`, linked or created based on the Expert's decision.
- **Caller:** `InboxReviewController`, which delegates to `InboxItem` and formats a tab-separated result.

The caller does not own the matching algorithm. The Expert chooses whether to link or create because it possesses the parsed booking information. This illustrates **GRASP Information Expert**, not Controller, Adapter or a separate Factory collaboration.

## Files and commands

- Production: information_expert/cpp/main.hpp, information_expert/cpp/main.cpp
- Test: `Part3/information_expert/cpp/test_main.cpp`
- Working directory: `Part3/information_expert/cpp`
- Compile: `g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o information_expert_tests`
- Test: `./information_expert_tests`
- Shared fixtures: `../../common_specs/information_expert_cases.tsv` and `../../common_specs/information_expert_expected.tsv`

## Verified outcome

- Runtime/compiler: g++ (Debian 14.2.0-19) 14.2.0, C++17
- **8/8 passed**, failures=0, errors=0, exit=0.
- Production LOC = **83** (nonblank, noncomment production lines only).
- Maximum function CC = **7** (frozen McCabe-style method).
- Fresh-process median = **4.390529 ms** (one warmup, five measured runs).
- Complete recorded results: `test_result.txt`, `timings.csv`.

## Simplification and limitations

The original DaPlanStan `InboxItem` maps parsed email booking information into TripItems and may create Expenses. Here, input uses a deterministic local TSV and at most one candidate item; no real database, Rails controller, Anthropic, Expense or email exists. The test runner verifies state changes in memory. Timing includes process startup, file reading and assertions, not only linking logic.
