# Part 3 / Strategy S3-N01 — verification summary

**Scope:** only `Strategy (GoF) — Cancellation Policy Evaluation`. Four implementations (Java, Python, JavaScript, C++); all other four pattern types are deliberately untouched. No DaPlanStan source modifications.

## Shared fixture integrity

- Exactly 15 frozen scenarios, ordered S01–S15; 11 success lines and 4 errors (S12–S15).
- All four runners read the same two files and compare actual output with the expected TSV.
- Source tests use no embedded expected-answer lists.
- SHA-256 `strategy_expected.tsv`: `9ace270b725c7863026ce1057af04c7415ebbd14c1aaecc16c9c89a4cb2d41e1`
- SHA-256 `strategy_cases.tsv`: `6397422cb3f9110c9c2b7ae1c1dd044578a15c1979767b30cb61e7b16c032871`

## Actual execution and static measurements

| Language | Runtime/compiler | Tests (pass/total) | Failures | Errors | Exit | Prod. LOC | Max CC | Five measured runs (ms) | Median (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|
| Java | OpenJDK / javac 21.0.12.1 | 15/15 | 0 | 0 | 0 | 52 | 12 | 77.186, 91.907, 104.042, 118.962, 87.222 | 91.907135 |
| Python | Python 3.13.5 | 15/15 | 0 | 0 | 0 | 54 | 8 | 846.949, 837.543, 827.757, 847.219, 839.469 | 839.468689 |
| JavaScript | Node v22.16.0 | 15/15 | 0 | 0 | 0 | 42 | 8 | 30.074, 38.741, 30.426, 33.440, 29.249 | 30.425864 |
| C++ | g++ 14.2.0 (C++17) | 15/15 | 0 | 0 | 0 | 74 | 15 | 2.665, 2.559, 2.738, 2.241, 2.582 | 2.582103 |

### Complexity rule and data sources

Production lines count nonblank, noncomment lines (Python docstrings excluded). C++ counts both `main.hpp` and `main.cpp`. Test sources, TSVs and generated binaries excluded. The measurement program in `evidence/measure_complexity.py` applies **1 + conditional branches + loops + cases + exception handlers + ternaries + each short-circuit operator** per function, using AST on Python and balanced function bodies with lexical decision detection on Java/JavaScript/C++. These are reproducible source-level McCabe-style measurements, not an external certified complexity tool. See `evidence/static_metrics.json` for per-function values.

Compilation is done before benchmarking. Timing is elapsed monotonic fresh-process time in milliseconds on this container: one unrecorded-for-median warmup (still included in each language's timings.csv), followed by five successful fixture-processing runs. Process startup, fixture parsing, output comparison and printing are included. Compilation is excluded. Every measured invocation exited 0 and matched the shared expected output. Timings are host-dependent and not isolated policy-operation benchmarks.

### Fidelity and limitations

Each language has a Context (`QuoteEvaluator`) and three separately implemented algorithms behind a shared `feeRate(secondsUntilStart)` method. A simple lookup selects the appropriate strategy; no combined fee-algorithm switch appears in Context. This mirrors the verified S3-N01 Strategy collaboration, but deliberately omits Rails, database-confirmation checks, provider cancellations and BigDecimal types (integer cents used instead). Only the fixed S01–S15 cases have been tested. Error reporting and times are local process evidence. There is no real cancellation, refund, payment, network call or application integration test.

**Faculty aggregation:** `strategy/strategy_append_ready.json` has four entries matching the required 11 `cross_language.csv` fields. This is *not* the final `cross_language.csv`; the remaining four pattern types will be added later.
