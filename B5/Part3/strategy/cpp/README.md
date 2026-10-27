# S3-N01 — Cancellation Policy Evaluation (C++)

**Pattern:** Strategy (GoF), frozen source instance S3-N01.

## Participant roles

- Context: `QuoteEvaluator.evaluate`.
- Strategy interface/protocol: `FeeStrategy abstract base class`, with `feeRate(secondsUntilStart)`.
- ConcreteStrategy: `FlexiblePolicy`, `ModeratePolicy`, `StrictPolicy`.
- Client: `test_main.cpp` (fixture-driven quote request handler).
- Implementation structure: polymorphic virtual method; owned strategy instances. Policy choice occurs in Context, but fee rules live in the three policy classes.

## Reproduce from the language folder

Working directory: `Part3/strategy/cpp` in the packaged Part3 tree.

Compile: `g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o strategy_tests`

Test (all 15 shared fixtures): `./strategy_tests`

Fixture inputs/expected: `../../common_specs/strategy_cases.tsv` and `../../common_specs/strategy_expected.tsv`.

No language-specific expected results exist. Tests return exit 1 if any output differs.

## Simplification and safety

The original Rails QuoteEvaluator validates email-linked booking eligibility and uses BigDecimal. Here eligibility is assumed satisfied so this tiny example isolates the **Strategy** delegation. Monetary values are integer cents; percentage rounding is half-up, equivalent for these supported values. Tests pass explicit seconds-to-start instead of reading wall-clock time. No real booking cancellation, refund, API request or database write occurs.

## Actual measurements (11 October 2026)

- Runtime/compiler: g++ (Debian 14.2.0-19) 14.2.0
- Test results: 15/15 passed, failures 0, errors 0, exit code 0.
- Production-only LOC: 74 (no tests, blank lines, comment-only lines or fixtures).
- Maximum function cyclomatic complexity: 15; per-function audit in `../../evidence/static_metrics.json`.
- One warmup plus five fresh-process measured fixture executions. Median: 2.582103 ms.
- Five raw measurements (ms): 2.665064, 2.558798, 2.737605, 2.241367, 2.582103.
- Raw execution results: `test_result.txt`; raw timing evidence: `timings.csv`.

Timing includes process startup, fixture reading, evaluation, comparison and output. Compilation is excluded. Results are environment-dependent; don't compare runtimes as isolated strategy algorithm speed.
