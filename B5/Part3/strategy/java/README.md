# S3-N01 — Cancellation Policy Evaluation (Java)

**Pattern:** Strategy (GoF), frozen source instance S3-N01.

## Participant roles

- Context: `QuoteEvaluator.evaluate`.
- Strategy interface/protocol: `FeeStrategy`, with `feeRate(secondsUntilStart)`.
- ConcreteStrategy: `FlexiblePolicy`, `ModeratePolicy`, `StrictPolicy`.
- Client: `TestMain.java` (fixture-driven quote request handler).
- Implementation structure: implements FeeStrategy; Map lookup. Policy choice occurs in Context, but fee rules live in the three policy classes.

## Reproduce from the language folder

Working directory: `Part3/strategy/java` in the packaged Part3 tree.

Compile: `javac Main.java TestMain.java`

Test (all 15 shared fixtures): `java TestMain`

Fixture inputs/expected: `../../common_specs/strategy_cases.tsv` and `../../common_specs/strategy_expected.tsv`.

No language-specific expected results exist. Tests return exit 1 if any output differs.

## Simplification and safety

The original Rails QuoteEvaluator validates email-linked booking eligibility and uses BigDecimal. Here eligibility is assumed satisfied so this tiny example isolates the **Strategy** delegation. Monetary values are integer cents; percentage rounding is half-up, equivalent for these supported values. Tests pass explicit seconds-to-start instead of reading wall-clock time. No real booking cancellation, refund, API request or database write occurs.

## Actual measurements (11 October 2026)

- Runtime/compiler: openjdk version "21.0.12.1" 2026-08-18; javac 21.0.12.1
- Test results: 15/15 passed, failures 0, errors 0, exit code 0.
- Production-only LOC: 52 (no tests, blank lines, comment-only lines or fixtures).
- Maximum function cyclomatic complexity: 12; per-function audit in `../../evidence/static_metrics.json`.
- One warmup plus five fresh-process measured fixture executions. Median: 91.907135 ms.
- Five raw measurements (ms): 77.186116, 91.907135, 104.041751, 118.962410, 87.222314.
- Raw execution results: `test_result.txt`; raw timing evidence: `timings.csv`.

Timing includes process startup, fixture reading, evaluation, comparison and output. Compilation is excluded. Results are environment-dependent; don't compare runtimes as isolated strategy algorithm speed.
