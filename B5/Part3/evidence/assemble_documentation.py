#!/usr/bin/env python3
"""Create reproducible README, evidence summary and append-ready S3-N01 data."""
import hashlib
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
metrics=json.loads((root/'evidence/static_metrics.json').read_text())
results=json.loads((root/'evidence/execution_results.json').read_text())
versions=json.loads((root/'evidence/environment_versions.json').read_text())
langs=[('Java','java','Main.java','javac Main.java TestMain.java','java TestMain','FeeStrategy', 'implements FeeStrategy; Map lookup'),
       ('Python','python','main.py','Not required','python3 test_main.py','FeeStrategy (ABC)', 'ABC implementations; dictionary lookup'),
       ('JavaScript','javascript','main.js','Not required','node test_main.js','feeRate duck-typed interface', 'objects implement feeRate; frozen policy map'),
       ('C++','cpp','main.cpp (with main.hpp)','g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o strategy_tests','./strategy_tests','FeeStrategy abstract base class', 'polymorphic virtual method; owned strategy instances')]
sha={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (root/'common_specs').glob('strategy_*.tsv')}
common='''# Frozen common Strategy specification — S3-N01

Selected confirmed DaPlanStan collaboration: **Strategy (GoF) — Cancellation Policy Evaluation**.
Source version: `scenario3_cancellation_policies`. These fixtures were fixed before implementation.

The same `strategy_cases.tsv` and `strategy_expected.tsv` are used by all four language test runners. Both are UTF-8, tab separated. The cases have the header
`case_id, policy_code, seconds_until_start, amount_cents, currency` (tabs, not commas).
The expected header describes the success fields. Each success line contains seven fields:
`case_id, OK, policy_code, fee_cents, refund_cents, currency, refundable`.
Each error line contains exactly three fields: `case_id, ERROR, error_code`.
The expected file is authoritative; runners compare whole output lines byte-for-byte after reading both fixtures.

`~` represents a missing timestamp. All 15 cases are independent. There are no real booking transactions.

## Frozen rules

- Flexible: >=86400 seconds to start: 0%; 1..86399: 10%; <=0: 100%.
- Moderate: >=259200: 0%; 86400..259199: 50%; <86400: 100%.
- Strict: always 100%.
- Fee percentage is an integer; half-up fee (cents) = `(amount_cents * percentage + 50) // 100` for valid nonnegative amounts; refund = amount minus fee. `refundable` is YES if refund > 0 and otherwise NO.
- Supported currencies: EUR, GBP, USD. Unknown policy -> `UNKNOWN_POLICY`, negative amount -> `INVALID_AMOUNT`, other currency -> `UNSUPPORTED_CURRENCY`, missing time -> `INVALID_TIME`.
- This is a quote-only problem: no eligibility database check, live clock, payment, booking cancellation, external request or persistent state.

## Case selection

S01 Moderate exactly 72h; S02 one second below 72h; S03 exactly 24h; S04 one second below 24h; S05 Flexible exactly 24h; S06 below 24h; S07 one second before start; S08 at start; S09 Strict at 96h; S10 Moderate on five cents (fee 3, refund 2); S11 Strict zero amount; S12 unknown policy; S13 negative amount; S14 unsupported JPY; S15 missing time.

## Fixture SHA-256
'''
for k,v in sha.items():common+=f'- `{k}`: `{v}`\n'
(root/'common_specs/README.md').write_text(common,encoding='utf-8')

for lang,folder,src,build,cmd,strategy,extra in langs:
    m,r=metrics[lang],results[lang]
    runtime={'Java':versions['Java']+'; '+versions['javac'], 'Python':versions['Python'], 'JavaScript':versions['Node.js'], 'C++':versions['g++']}[lang]
    text=f'''# S3-N01 — Cancellation Policy Evaluation ({lang})

**Pattern:** Strategy (GoF), frozen source instance S3-N01.

## Participant roles

- Context: `QuoteEvaluator.evaluate`.
- Strategy interface/protocol: `{strategy}`, with `feeRate(secondsUntilStart)`.
- ConcreteStrategy: `FlexiblePolicy`, `ModeratePolicy`, `StrictPolicy`.
- Client: `{ 'TestMain.java' if lang=='Java' else ('test_main.py' if lang=='Python' else ('test_main.js' if lang=='JavaScript' else 'test_main.cpp')) }` (fixture-driven quote request handler).
- Implementation structure: {extra}. Policy choice occurs in Context, but fee rules live in the three policy classes.

## Reproduce from the language folder

Working directory: `Part3/strategy/{folder}` in the packaged Part3 tree.

Compile: `{build}`

Test (all 15 shared fixtures): `{cmd}`

Fixture inputs/expected: `../../common_specs/strategy_cases.tsv` and `../../common_specs/strategy_expected.tsv`.

No language-specific expected results exist. Tests return exit 1 if any output differs.

## Simplification and safety

The original Rails QuoteEvaluator validates email-linked booking eligibility and uses BigDecimal. Here eligibility is assumed satisfied so this tiny example isolates the **Strategy** delegation. Monetary values are integer cents; percentage rounding is half-up, equivalent for these supported values. Tests pass explicit seconds-to-start instead of reading wall-clock time. No real booking cancellation, refund, API request or database write occurs.

## Actual measurements (11 October 2026)

- Runtime/compiler: {runtime}
- Test results: 15/15 passed, failures 0, errors 0, exit code 0.
- Production-only LOC: {m['source_loc']} (no tests, blank lines, comment-only lines or fixtures).
- Maximum function cyclomatic complexity: {m['max_function_cc']}; per-function audit in `../../evidence/static_metrics.json`.
- One warmup plus five fresh-process measured fixture executions. Median: {r['median_process_ms']:.6f} ms.
- Five raw measurements (ms): {', '.join(f'{v:.6f}' for v in r['five_measurements_ms'])}.
- Raw execution results: `test_result.txt`; raw timing evidence: `timings.csv`.

Timing includes process startup, fixture reading, evaluation, comparison and output. Compilation is excluded. Results are environment-dependent; don't compare runtimes as isolated strategy algorithm speed.
'''
    (root/'strategy'/folder/'README.md').write_text(text,encoding='utf-8')

append=[]
for lang,folder,src,build,cmd,strategy,extra in langs:
    m,r=metrics[lang],results[lang]
    runtime={'Java': versions['Java']+'; '+versions['javac'], 'Python': versions['Python'], 'JavaScript': 'Node.js '+versions['Node.js'], 'C++': versions['g++']+'; C++17 -O2'}[lang]
    srcpath=f'Part3/strategy/{folder}/'+('main.cpp' if lang=='C++' else src)
    append.append({
      'pattern_name':'Strategy',
      'instance_name':'Cancellation Policy Evaluation',
      'language': lang,
      'snippet_path': srcpath,
      'source_loc':m['source_loc'],
      'max_function_cc':m['max_function_cc'],
      'runtime_compiler':runtime,
      'test_command':f'cd Part3/strategy/{folder} && '+(build+' && ' if build != 'Not required' else '')+cmd,
      'test_result':'15/15 passed; failures=0; errors=0; exit_code=0',
      'median_process_ms':r['median_process_ms'],
      'language_notes':f'S3-N01 GoF Strategy; Context=QuoteEvaluator; protocol={strategy}; ConcreteStrategies=FlexiblePolicy,ModeratePolicy,StrictPolicy; client=test runner; '+extra+('; LOC includes main.hpp.' if lang=='C++' else '')+' Fixed fixtures and process-level timings; no real cancellation.'
    })
(root/'strategy/strategy_append_ready.json').write_text(json.dumps(append, indent=2)+'\n',encoding='utf-8')

summary='''# Part 3 / Strategy S3-N01 — verification summary

**Scope:** only `Strategy (GoF) — Cancellation Policy Evaluation`. Four implementations (Java, Python, JavaScript, C++); all other four pattern types are deliberately untouched. No DaPlanStan source modifications.

## Shared fixture integrity

- Exactly 15 frozen scenarios, ordered S01–S15; 11 success lines and 4 errors (S12–S15).
- All four runners read the same two files and compare actual output with the expected TSV.
- Source tests use no embedded expected-answer lists.
'''
for k,v in sha.items():summary+=f'- SHA-256 `{k}`: `{v}`\n'
summary+='''
## Actual execution and static measurements

| Language | Runtime/compiler | Tests (pass/total) | Failures | Errors | Exit | Prod. LOC | Max CC | Five measured runs (ms) | Median (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|
'''
for lang,folder,src,build,cmd,strategy,extra in langs:
    m,r=metrics[lang],results[lang]
    ver={'Java':'OpenJDK / javac 21.0.12.1', 'Python':'Python 3.13.5','JavaScript':'Node v22.16.0','C++':'g++ 14.2.0 (C++17)'}[lang]
    summary+=f'| {lang} | {ver} | 15/15 | 0 | 0 | 0 | {m["source_loc"]} | {m["max_function_cc"]} | '+', '.join(f'{x:.3f}' for x in r['five_measurements_ms'])+f' | {r["median_process_ms"]:.6f} |\n'
summary+='''
### Complexity rule and data sources

Production lines count nonblank, noncomment lines (Python docstrings excluded). C++ counts both `main.hpp` and `main.cpp`. Test sources, TSVs and generated binaries excluded. The measurement program in `evidence/measure_complexity.py` applies **1 + conditional branches + loops + cases + exception handlers + ternaries + each short-circuit operator** per function, using AST on Python and balanced function bodies with lexical decision detection on Java/JavaScript/C++. These are reproducible source-level McCabe-style measurements, not an external certified complexity tool. See `evidence/static_metrics.json` for per-function values.

Compilation is done before benchmarking. Timing is elapsed monotonic fresh-process time in milliseconds on this container: one unrecorded-for-median warmup (still included in each language's timings.csv), followed by five successful fixture-processing runs. Process startup, fixture parsing, output comparison and printing are included. Compilation is excluded. Every measured invocation exited 0 and matched the shared expected output. Timings are host-dependent and not isolated policy-operation benchmarks.

### Fidelity and limitations

Each language has a Context (`QuoteEvaluator`) and three separately implemented algorithms behind a shared `feeRate(secondsUntilStart)` method. A simple lookup selects the appropriate strategy; no combined fee-algorithm switch appears in Context. This mirrors the verified S3-N01 Strategy collaboration, but deliberately omits Rails, database-confirmation checks, provider cancellations and BigDecimal types (integer cents used instead). Only the fixed S01–S15 cases have been tested. Error reporting and times are local process evidence. There is no real cancellation, refund, payment, network call or application integration test.

**Faculty aggregation:** `strategy/strategy_append_ready.json` has four entries matching the required 11 `cross_language.csv` fields. This is *not* the final `cross_language.csv`; the remaining four pattern types will be added later.
'''
(root/'STRATEGY_VERIFICATION_SUMMARY.md').write_text(summary,encoding='utf-8')
print('Wrote common_specs README, four language READMEs, append-ready JSON, verification summary.')
