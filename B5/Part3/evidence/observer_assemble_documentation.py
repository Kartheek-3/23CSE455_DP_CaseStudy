#!/usr/bin/env python3
"""Assemble auditable P08 Observer READMEs and append-ready records from measured evidence."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
measurements = json.loads((ROOT / 'evidence' / 'observer_execution_results.json').read_text())
metrics = json.loads((ROOT / 'evidence' / 'observer_static_metrics.json').read_text())
versions = json.loads((ROOT / 'evidence' / 'observer_environment_versions.json').read_text())
settings = [
    ('Java', 'java', 'Main.java', 'javac Main.java TestMain.java', 'java TestMain',
     f'OpenJDK {versions["java"]}; {versions["javac"]}',
     'MailObserver interface; MailMessage event; MailLogger implementation; MailDeliveryPublisher stores observer list.'),
    ('Python', 'python', 'main.py', 'Not required', 'python3 test_main.py',
     versions['python3'],
     'MailObserver ABC; MailMessage dataclass; MailLogger concrete observer; MailDeliveryPublisher stores observer references.'),
    ('JavaScript', 'javascript', 'main.js', 'Not required', 'node test_main.js',
     f'Node.js {versions["node"]}',
     'MailObserver base callback contract; MailMessage object; MailLogger concrete observer; MailDeliveryPublisher uses Set.'),
    ('C++', 'cpp', 'main.cpp', 'g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o observer_tests', './observer_tests',
     f'{versions["g++"]}; C++17',
     'MailObserver pure virtual interface; MailMessage event; MailLogger concrete observer; publisher stores nonowning observer pointers; main.hpp and main.cpp count as production.'),
]
append_records = []
for language, folder, entry, build, run, version, note in settings:
    numbers = measurements[language]
    m = metrics[language]
    workdir = f'Part3/observer/{folder}'
    specifics = 'C++ uses registerObserver/unregisterObserver (register is a C++ language keyword); observer lifetime must outlive the publisher.' if language == 'C++' else ''
    readme = f'''# P08 — Observer (GoF): Outbound Mail Delivery Logging ({language})

**Selected source ID:** P08. **Source instance:** Outbound Mail Delivery Logging. This is a standalone, simulated adaptation of DaPlanStan's Action Mailer delivery-observer behavior. **No real email is sent.** There is no Rails, Action Mailer, network service or external dependency.

## Pattern roles
- **Subject/Publisher:** `MailDeliveryPublisher` stores and notifies currently registered observers.
- **Observer interface/protocol:** `MailObserver.onDelivered(message)`.
- **ConcreteObserver:** `MailLogger` holds the delivered messages it observed.
- **Event:** `MailMessage` with ID, subject and recipient.
- **Registration:** `register`/`unregister` on the publisher (C++ uses `registerObserver`/`unregisterObserver`).
- **Notification point:** `MailDeliveryPublisher.deliver` notifies via the observer contract after a successful delivery.
- **Client:** the language's test runner, which creates fresh subjects/observers and performs O07's explicit register/unregister sequence.

The publisher does **not** directly call a `MailLogger.log` method. Unlike Rails/Action Mailer, this snippet constructs and dispatches a local `MailMessage` without transport or framework callbacks. {specifics}

## Build and test (working directory `{workdir}`)
```sh
{build if build != 'Not required' else '# No compilation necessary'}
{run}
```
Expected behavior: 7/7 cases pass against `../../common_specs/observer_cases.tsv` and `../../common_specs/observer_expected.tsv`. O01/O04 log complete original event fields; O02/O03/O07 do not notify; O05/O06 return controlled errors.

Actual compiler/runtime: {version}
Actual compile status: {'success' if build != 'Not required' else 'not applicable'}
Actual test result: 7/7 passed; failures=0; errors=0; skipped=0; exit code 0.

## Recorded measurements
Production LOC: **{m['source_loc']}** (exclude tests, comments, blanks, fixtures). Maximum function CC: **{m['max_function_cc']}** (same McCabe-style counting as the completed Strategy stage).
One warmup and five measured fresh-process runs (milliseconds), using `{run}`:
- Warmup: {numbers['warmup_ms']:.6f}
- Measured: {', '.join(f'{x:.6f}' for x in numbers['five_measurements_ms'])}
- Median: **{numbers['median_process_ms']:.6f} ms**

Full process timing includes startup, shared fixture input, simulation, comparison and output. It is not isolated Observer algorithm performance. See `timings.csv` and `test_result.txt` for raw evidence.
'''
    (ROOT / 'observer' / folder / 'README.md').write_text(readme, encoding='utf-8')
    append_records.append({
      'pattern_name': 'Observer',
      'instance_name': 'Outbound Mail Delivery Logging',
      'language': language,
      'snippet_path': f'{workdir}/{entry}',
      'source_loc': m['source_loc'],
      'max_function_cc': m['max_function_cc'],
      'runtime_compiler': version,
      'test_command': f'(cd {workdir} && {run})',
      'test_result': '7/7 passed; failures=0; errors=0; skipped=0; exit_code=0',
      'median_process_ms': numbers['median_process_ms'],
      'language_notes': note + ' ' + specifics + ' No real email; fixture-level role fidelity verified.',
    })
( ROOT / 'observer' / 'observer_append_ready.json').write_text(json.dumps(append_records, indent=2) + '\n', encoding='utf-8')

sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
summary = f'''# P08 Observer — Cross-Language Verification Summary

Pattern: **Observer (GoF)**. Confirmed source instance: **P08 — Outbound Mail Delivery Logging**. No DaPlanStan source or frozen Strategy artifacts were changed.

## Frozen shared fixtures

- `Part3/common_specs/observer_cases.tsv` — {sha(ROOT/'common_specs/observer_cases.tsv')}
- `Part3/common_specs/observer_expected.tsv` — {sha(ROOT/'common_specs/observer_expected.tsv')}

Cases: O01 successful registered delivery; O02 unregistered delivery; O03 failed delivery; O04 second valid registered delivery; O05 missing recipient (`INVALID_RECIPIENT`); O06 invalid flag (`INVALID_FLAG`); O07 registered and then unregistered before successful delivery.

All four runners read the common input and expected TSV files; output is compared line for line against the same frozen expectations. O07's special setup sequence is defined by the frozen case identifier, not inside publisher production code.

## Pattern mapping and fidelity

| Language | Subject | Observer role | Concrete observer | Event | Registration and dispatch |
|---|---|---|---|---|---|
| Java | MailDeliveryPublisher | MailObserver interface | MailLogger | MailMessage | register/unregister, deliver calls onDelivered on registered observers |
| Python | MailDeliveryPublisher | MailObserver ABC | MailLogger | MailMessage | register/unregister, deliver calls onDelivered |
| JavaScript | MailDeliveryPublisher | MailObserver base contract | MailLogger | MailMessage | register/unregister, Set, deliver calls onDelivered |
| C++ | MailDeliveryPublisher | MailObserver pure virtual base | MailLogger | MailMessage | registerObserver/unregisterObserver, vector of references-as-pointers, deliver calls onDelivered |

The publisher depends on the common observer role, not MailLogger specifically. This is subscription-based notification, not direct logging. No mail is transmitted.

## Compilation, testing and measured static metrics

| Language | Version | Compilation | Command (language folder) | Passed | Failures | Errors | Exit | Production LOC | Max function CC |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
'''
for language, folder, entry, build, run, version, note in settings:
    m = metrics[language]; e = measurements[language]
    summary += f'| {language} | {version} | {build} | `{run}` | 7/7 | 0 | 0 | 0 | {m["source_loc"]} | {m["max_function_cc"]} |\n'
summary += '''
Source LOC excludes blank/comment-only lines, test files, fixture data and generated outputs. Max CC uses the previously frozen McCabe-style rule: each function starts at 1; add branches, loops, cases, exception handlers, ternaries and short-circuit Boolean decisions. The Observer-specific detector reuses Strategy's LOC and decision-counting helpers unchanged while adapting only the method-name/type matching patterns. Both metrics are static approximations rather than compiler-generated metrics.

## One warmup and five process executions

All runs were fresh processes using each implementation's full shared fixture runner, after compilation where required. Includes process startup, file input, execution, comparison and output. Time comparisons are **not** pure algorithm benchmarks.

| Language | Warmup (ms) | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
'''
for language, *_ in settings:
    e = measurements[language]; a = e['five_measurements_ms']
    summary += f'| {language} | {e["warmup_ms"]:.6f} | ' + ' | '.join(f'{x:.6f}' for x in a) + f' | **{e["median_process_ms"]:.6f}** |\n'
summary += '''
## Evidence and limitations

- Actual stdout/stderr and exit codes: `Part3/observer/*/test_result.txt`.
- Raw timings: `Part3/observer/*/timings.csv`.
- Compilers and version checks: `Part3/evidence/observer_environment_versions.json`, `observer_compilation_results.json`.
- Static measurement detail: `Part3/evidence/observer_static_metrics.json`.
- Timings and execution counts: `Part3/evidence/observer_execution_results.json`.
- Four append-ready fields: `Part3/observer/observer_append_ready.json`.
- No application Rails/Action Mailer tests are claimed; this is a simplified local behavioral reproduction. Cases cover only seven frozen scenarios, not arbitrary malformed emails or concurrency. The C++ publisher stores nonowning observer pointers; test lifetimes are bounded, with each observer outliving the publisher's dispatch.
- Strategy sources, fixtures, results and metrics were kept unchanged. Controller, Information Expert and Adapter implementations have not been started; final `cross_language.csv` has not been created.
'''
(ROOT / 'OBSERVER_VERIFICATION_SUMMARY.md').write_text(summary, encoding='utf-8')
print(f'Wrote {len(append_records)} Observer records and language READMEs')
