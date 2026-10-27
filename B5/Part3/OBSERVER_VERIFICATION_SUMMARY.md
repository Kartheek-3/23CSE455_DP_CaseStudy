# P08 Observer — Cross-Language Verification Summary

Pattern: **Observer (GoF)**. Confirmed source instance: **P08 — Outbound Mail Delivery Logging**. No DaPlanStan source or frozen Strategy artifacts were changed.

## Frozen shared fixtures

- `Part3/common_specs/observer_cases.tsv` — 94b91711bd90a40ef91991c8f0a584049651ccdf7f56a873ca6693d705cd1194
- `Part3/common_specs/observer_expected.tsv` — 0fa446f53a67ef75c77c32723c07d4f27877e5cad1e9deea08c44b3fd9c5ebc8

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
| Java | OpenJDK openjdk version "21.0.12.1" 2026-08-18; javac 21.0.12.1 | javac Main.java TestMain.java | `java TestMain` | 7/7 | 0 | 0 | 0 | 47 | 5 |
| Python | Python 3.13.5 | Not required | `python3 test_main.py` | 7/7 | 0 | 0 | 0 | 32 | 5 |
| JavaScript | Node.js v22.16.0 | Not required | `node test_main.js` | 7/7 | 0 | 0 | 0 | 43 | 5 |
| C++ | g++ (Debian 14.2.0-19) 14.2.0; C++17 | g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o observer_tests | `./observer_tests` | 7/7 | 0 | 0 | 0 | 60 | 4 |

Source LOC excludes blank/comment-only lines, test files, fixture data and generated outputs. Max CC uses the previously frozen McCabe-style rule: each function starts at 1; add branches, loops, cases, exception handlers, ternaries and short-circuit Boolean decisions. The Observer-specific detector reuses Strategy's LOC and decision-counting helpers unchanged while adapting only the method-name/type matching patterns. Both metrics are static approximations rather than compiler-generated metrics.

## One warmup and five process executions

All runs were fresh processes using each implementation's full shared fixture runner, after compilation where required. Includes process startup, file input, execution, comparison and output. Time comparisons are **not** pure algorithm benchmarks.

| Language | Warmup (ms) | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Java | 88.642371 | 126.393189 | 104.698624 | 103.541662 | 116.814760 | 109.548044 | **109.548044** |
| Python | 1080.327503 | 1158.487022 | 1127.800980 | 1101.022482 | 1133.244762 | 1250.233401 | **1133.244762** |
| JavaScript | 37.965193 | 36.192922 | 46.430877 | 44.341686 | 43.672670 | 37.155430 | **43.672670** |
| C++ | 3.002566 | 2.167666 | 2.148941 | 2.421307 | 2.325304 | 2.394832 | **2.325304** |

## Evidence and limitations

- Actual stdout/stderr and exit codes: `Part3/observer/*/test_result.txt`.
- Raw timings: `Part3/observer/*/timings.csv`.
- Compilers and version checks: `Part3/evidence/observer_environment_versions.json`, `observer_compilation_results.json`.
- Static measurement detail: `Part3/evidence/observer_static_metrics.json`.
- Timings and execution counts: `Part3/evidence/observer_execution_results.json`.
- Four append-ready fields: `Part3/observer/observer_append_ready.json`.
- No application Rails/Action Mailer tests are claimed; this is a simplified local behavioral reproduction. Cases cover only seven frozen scenarios, not arbitrary malformed emails or concurrency. The C++ publisher stores nonowning observer pointers; test lifetimes are bounded, with each observer outliving the publisher's dispatch.
- Strategy sources, fixtures, results and metrics were kept unchanged. Controller, Information Expert and Adapter implementations have not been started; final `cross_language.csv` has not been created.
