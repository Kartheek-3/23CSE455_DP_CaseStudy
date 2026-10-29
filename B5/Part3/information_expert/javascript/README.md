# P01 — Information Expert (GRASP): Parsed Email to Trip Record Linking

## Roles

- **Expert:** `InboxItem`, which holds inbox ID, trip ID, parsed provider name and confirmation reference and implements `linkOrCreateTripItem` (Python: `link_or_create_trip_item`).
- **Domain collection:** `Trip` with a list of `TripItem` records.
- **Domain record:** `TripItem`, linked or created based on the Expert's decision.
- **Caller:** `InboxReviewController`, which delegates to `InboxItem` and formats a tab-separated result.

The caller does not own the matching algorithm. The Expert chooses whether to link or create because it possesses the parsed booking information. This illustrates **GRASP Information Expert**, not Controller, Adapter or a separate Factory collaboration.

## Files and commands

- Production: information_expert/javascript/main.js
- Test: `Part3/information_expert/javascript/test_main.js`
- Working directory: `Part3/information_expert/javascript`
- Compile: `not applicable`
- Test: `node test_main.js`
- Shared fixtures: `../../common_specs/information_expert_cases.tsv` and `../../common_specs/information_expert_expected.tsv`

## Verified outcome

- Runtime/compiler: Node.js v22.16.0
- **8/8 passed**, failures=0, errors=0, exit=0.
- Production LOC = **38** (nonblank, noncomment production lines only).
- Maximum function CC = **6** (frozen McCabe-style method).
- Fresh-process median = **36.435657 ms** (one warmup, five measured runs).
- Complete recorded results: `test_result.txt`, `timings.csv`.

## Simplification and limitations

The original DaPlanStan `InboxItem` maps parsed email booking information into TripItems and may create Expenses. Here, input uses a deterministic local TSV and at most one candidate item; no real database, Rails controller, Anthropic, Expense or email exists. The test runner verifies state changes in memory. Timing includes process startup, file reading and assertions, not only linking logic.
