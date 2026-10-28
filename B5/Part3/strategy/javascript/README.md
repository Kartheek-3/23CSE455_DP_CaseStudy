# S3-N01 — Cancellation Policy Evaluation (JavaScript)

**Pattern:** Strategy (GoF), frozen source instance S3-N01.

## Participant roles

- Context: `QuoteEvaluator.evaluate`.
- Strategy interface/protocol: `feeRate duck-typed interface`, with `feeRate(secondsUntilStart)`.
- ConcreteStrategy: `FlexiblePolicy`, `ModeratePolicy`, `StrictPolicy`.
- Client: `test_main.js` (fixture-driven quote request handler).
- Implementation structure: objects implement feeRate; frozen policy map. Policy choice occurs in Context, but fee rules live in the three policy classes.

## Reproduce from the language folder

Working directory: `Part3/strategy/javascript` in the packaged Part3 tree.

Compile: `Not required`

Test (all 15 shared fixtures): `node test_main.js`

Fixture inputs/expected: `../../common_specs/strategy_cases.tsv` and `../../common_specs/strategy_expected.tsv`.

No language-specific expected results exist. Tests return exit 1 if any output differs.

## Simplification and safety

The original Rails QuoteEvaluator validates email-linked booking eligibility and uses BigDecimal. Here eligibility is assumed satisfied so this tiny example isolates the **Strategy** delegation. Monetary values are integer cents; percentage rounding is half-up, equivalent for these supported values. Tests pass explicit seconds-to-start instead of reading wall-clock time. No real booking cancellation, refund, API request or database write occurs.

## Actual measurements (11 October 2026)

- Runtime/compiler: v22.16.0
- Test results: 15/15 passed, failures 0, errors 0, exit code 0.
- Production-only LOC: 42 (no tests, blank lines, comment-only lines or fixtures).
- Maximum function cyclomatic complexity: 8; per-function audit in `../../evidence/static_metrics.json`.
- One warmup plus five fresh-process measured fixture executions. Median: 30.425864 ms.
- Five raw measurements (ms): 30.074123, 38.740904, 30.425864, 33.440363, 29.249207.
- Raw execution results: `test_result.txt`; raw timing evidence: `timings.csv`.

Timing includes process startup, fixture reading, evaluation, comparison and output. Compilation is excluded. Results are environment-dependent; don't compare runtimes as isolated strategy algorithm speed.
