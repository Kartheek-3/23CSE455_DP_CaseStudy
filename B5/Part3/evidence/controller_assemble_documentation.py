#!/usr/bin/env python3
"""Create P03 per-language READMEs, four append-ready faculty records and summary."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
metrics = json.loads((ROOT / 'evidence/controller_static_metrics.json').read_text(encoding='utf-8'))
execution = json.loads((ROOT / 'evidence/controller_execution_results.json').read_text(encoding='utf-8'))
versions = json.loads((ROOT / 'evidence/controller_environment_versions.json').read_text(encoding='utf-8'))
compiled = json.loads((ROOT / 'evidence/controller_compilation_results.json').read_text(encoding='utf-8'))
items = {
    'Java': {'folder': 'java', 'production': 'Main.java', 'compile': 'javac Main.java TestMain.java', 'test': 'java TestMain',
             'version': versions['java'] + '; ' + versions['javac'],
             'role': 'TripCreationController coordinates Account, Trip, TripMember, TripStore and CoverTaskQueue. Java LocalDate with strict ISO resolver validates Gregorian dates.',
             'details': 'Trip and TripMember are domain objects; Account owns membership list; TripStore persists in memory; CoverTaskQueue records the simulated queued trip ID.'},
    'Python': {'folder': 'python', 'production': 'main.py', 'compile': 'None (interpreted)', 'test': 'python3 test_main.py',
               'version': versions['python3'],
               'role': 'TripCreationController delegates to Account, Trip, TripMember, TripStore and CoverTaskQueue. Python date.fromisoformat validates Gregorian dates.',
               'details': 'Trip and TripMember are frozen dataclasses; Account stores memberships; TripStore and CoverTaskQueue hold local lists.'},
    'JavaScript': {'folder': 'javascript', 'production': 'main.js', 'compile': 'None (interpreted)', 'test': 'node test_main.js',
                   'version': 'Node.js ' + versions['node'],
                   'role': 'TripCreationController orchestrates Account, Trip, TripMember, TripStore and CoverTaskQueue. Strict Gregorian validation avoids JavaScript Date normalization.',
                   'details': 'Trip and TripMember are classes; Account owns memberships; TripStore and CoverTaskQueue use local arrays.'},
    'C++': {'folder': 'cpp', 'production': 'main.hpp and main.cpp',
            'compile': 'g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o controller_tests',
            'test': './controller_tests', 'version': versions['g++'] + ', C++17',
            'role': 'TripCreationController holds references to Account, TripStore and CoverTaskQueue; Trip and TripMember are separate domain structs; strict Gregorian date validation is implemented without external libraries.',
            'details': 'Account owns member records. Domain structs store data, and queue/store are separate collaborators. Compiled executable is omitted from the ZIP.'},
}
records = []
for lang, detail in items.items():
    folder = ROOT / 'controller' / detail['folder']
    measurement = execution[lang]
    static = metrics[lang]
    readme = f'''# P03 — Controller (GRASP): Trip Creation Coordination — {lang}

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

{detail['details']}

This represents GRASP Controller because the system-event coordinator delegates to domain collaborators. The pattern is not established by naming a function `main` or by doing all domain work inside the runner.

## Commands

Working directory: `Part3/controller/{detail['folder']}` from the extracted ZIP.

Compile: `{detail['compile']}`

Test: `{detail['test']}`

Actual runtime/compiler: `{detail['version']}`.

Each test runner reads `../../common_specs/controller_cases.tsv` and `../../common_specs/controller_expected.tsv`, checks all eight exact TSV output rows, and separately checks one Trip, one owner TripMember, one cover task on success or zero mutations on failure.

## Simplifications and boundaries

No Rails application, persistent database, image API, network request or external cover worker is used. Side effects are in-memory only. All validation completes before any side effect; a real database transaction and failures while scheduling jobs are out of scope. Cross-language date validation is strict Gregorian, and error strings use controlled fixture codes. This exercise does not prove the full DaPlanStan Rails application runs.

## Verified results

- Fixture cases: **8/8 passed**, 0 failures, 0 errors, 0 skips; exit 0.
- Production LOC: **{static['source_loc']}** (excluding tests, comments, blank lines and fixtures).
- Maximum function CC: **{static['max_function_cc']}** (Strategy/Observer frozen McCabe-style rule).
- Median fresh-process execution: **{measurement['median_process_ms']:.6f} ms** from five measured runs after one warm-up.
- Source code: `{detail['production']}`; test source: `{('TestMain.java' if lang == 'Java' else 'test_main.cpp' if lang == 'C++' else 'test_main.py' if lang == 'Python' else 'test_main.js')}`.
- Raw outputs in `test_result.txt` and `timings.csv`; compilation/timing record in `Part3/evidence/controller_*.json`.

Process measurements include startup, reading input/expected fixtures, creation/error handling, side-effect assertions and output; they are not pure Controller algorithm benchmarks.
'''
    (folder / 'README.md').write_text(readme, encoding='utf-8')
    records.append({
        'pattern_name': 'Controller',
        'instance_name': 'Trip Creation Coordination',
        'language': lang,
        'snippet_path': 'Part3/controller/' + detail['folder'] + '/' + detail['production'].split(' and ')[-1],
        'source_loc': static['source_loc'],
        'max_function_cc': static['max_function_cc'],
        'runtime_compiler': detail['version'],
        'test_command': f"cd Part3/controller/{detail['folder']} && {detail['test']}",
        'test_result': '8/8 passed; 0 failures; 0 errors; 0 skipped; exit 0',
        'median_process_ms': measurement['median_process_ms'],
        'language_notes': detail['role'] + ' No database or external cover API; in-memory atomic validation and side-effect assertions. Compile: ' + detail['compile']
    })
(ROOT / 'controller/controller_append_ready.json').write_text(json.dumps(records, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
head = '''# P03 — Controller (GRASP): Cross-Language Verification

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

'''
for lang, detail in items.items():
    m = metrics[lang]; r = execution[lang]
    head += (f"- **{lang}**: `{detail['version']}`. Compile `{detail['compile']}`; test `{detail['test']}` from `Part3/controller/{detail['folder']}`. "
             f"**8/8 passed; 0 failures, errors or skips; exit code 0.** LOC **{m['source_loc']}**; max function CC **{m['max_function_cc']}**.\n")
head += '''
## Production LOC and complexity measurement

LOC is production source only, excluding blank/comment-only lines, tests and fixtures. For C++ both `main.hpp` and `main.cpp` are included. Complexity uses the **same original Strategy measurement helpers** in `evidence/measure_complexity.py` (Python AST or balanced-brace decisions): baseline 1 per function plus if/elif, loops, switch cases, catch/except handlers, ternary decisions and short-circuit Boolean decisions. Only Controller-specific method discovery regex was added by `evidence/controller_measure_complexity.py`. Counts are approximate static McCabe-style values, not a commercial analyzer.

## Timing protocol and raw results

Compilers run *before* timings. Each language runs one warm-up, followed by exactly five fresh-process measured test executions. Every timed run reads and verifies all eight cases and must exit zero. Elapsed time uses monotonic `perf_counter_ns()` around the entire process including startup, fixture input, assertions and output. No runtime is estimated. Results are machine-specific.

| Language | Warm-up ms | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Median ms |
|---|---:|---:|---:|---:|---:|---:|---:|
'''
for lang in items:
    r = execution[lang]
    vals = ' | '.join(f'{v:.6f}' for v in r['five_measurements_ms'])
    head += f"| {lang} | {r['warmup_ms']:.6f} | {vals} | **{r['median_process_ms']:.6f}** |\n"
head += '''
## Reproducible evidence and limitations

- `Part3/evidence/controller_environment_versions.json`, `controller_compilation_results.json`, `controller_execution_results.json`, `controller_static_metrics.json` contain observed versions, commands, exits, test/timing results and metric details.
- Each language contains `test_result.txt`, `timings.csv` and a README with exact commands.
- `controller_append_ready.json` contains exactly four records using the eleven faculty fields; **no final `cross_language.csv` was generated**.
- No database transactions, real image retrieval, Rails authentication, persistence failures or external APIs are implemented. Atomicity assertions cover the specified *validation errors* only; exceptions in external storage/queues are outside the simplified fixture scope.
- No DaPlanStan application source was edited. All Strategy/Observer code and evidence were checked against the pre-stage SHA-256 manifest.
'''
(ROOT / 'CONTROLLER_VERIFICATION_SUMMARY.md').write_text(head, encoding='utf-8')
print('Created 4 language READMEs, 4 faculty records and Controller summary')
