# Part 3: one problem per detected pattern type, in four languages

| Folder | Pattern | JUnit instance it is based on | Written by |
|---|---|---|---|
| `observer-test-listeners/` | Observer | C1: `TestExecutionListener`, with failures isolated as in `CompositeTestExecutionListener.notifyEach` | claude.ai |
| `composite-test-tree/` | Composite | A1: the `TestDescriptor` tree (engine, classes, methods), with `prune()` | claude.ai |
| `strategy-test-filters/` | Strategy | A3: `PostDiscoveryFilter` strategies applied by the discovery orchestrator | Claude Code |
| `adapter-listener-bridge/` | Adapter | B7: `ExecutionListenerAdapter` (engine events to `TestExecutionListener`) | Claude Code |
| `decorator-timeout-invocation/` | Decorator | D10: timeout `Invocation` wrappers | Claude Code |
| `template-method-engine/` | Template Method | B1: `HierarchicalTestEngine.execute` skeleton | Claude Code |
| `command-task-queue/` | Command | B9: `NodeTestTask` / `TestTask` run by an executor | Claude Code |
| `null-object-listener/` | Null Object | C7: `EngineExecutionListener.NOOP` | Claude Code |
| `chain-of-responsibility-interceptors/` | Chain of Responsibility | D9: `InvocationInterceptorChain` | Claude Code |
| `factory-method-executors/` | Factory Method | B2: `createExecutorService` factory method | Claude Code |

Each problem folder has the same layout:

```
test-data/     input file(s), the exact expected output, a bad input and its expected error
java/          code in src/, test runner in test/, README.md
python/        code, test_*.py (unittest), README.md
javascript/    code in src/, test/*.test.js (node:test), README.md
cpp/           code, test_main.cpp, README.md
```

Every version reads the same input and prints byte-for-byte the same output, which each test
runner checks against `test-data/expected-output.txt`. Each test runner also checks that the bad
input fails with the exact message in `test-data/expected-error.txt`, plus one pattern-specific
check (a throwing listener does not stop the next one; a leaf and a container answer `countTests`
the same way). Standard library only; nothing to install.

The exact commands are in each language's README, to be run from that language's folder.
`sh run-all.sh` (from this folder) runs all of them in order (110 commands for the 10 problems) and diffs every program's output against the expected file.

## What was run, and with which versions

`RUN-LOG-web-sandbox.txt` (named `RUN-LOG.txt` in the web session) is the full, unedited output of the web session's `sh run-all.sh` for the first two problems only: 30 commands, all exit 0, and all
eight programs' output identical to `expected-output.txt`. It was run in a Linux container, whose
toolchain is older than yours:

| Tool | Used here | Yours |
|---|---|---|
| Java | OpenJDK 21.0.12.1 | Java 25 |
| Python | 3.13.16 | 3.14 |
| Node.js | v22.22.0 | 26 |
| C++ | Ubuntu clang 18.1.3 and g++ 13.3.0, `-std=c++20` (libstdc++) | Apple clang 21, C++20 (libc++) |

The code avoids anything newer than these versions and anything removed since, so it should run
unchanged on yours; there was no way to run your exact versions here. The `duration_ms` lines in
the Node test output are printed by `node --test` itself; nothing was timed on purpose.

Extra checks that are not in the log:
- Both C++ test runners also passed when built with g++ and `-fsanitize=address,undefined`
  (no leaks or memory errors). The C++ headers include everything they use directly, because Apple's
  libc++ is stricter about indirect includes than the libstdc++ used here.
- 16 more inputs (every parser error message, extra whitespace, `\r\n` line endings, a reason with
  spaces, a tag that matches nothing) gave identical output and exit codes in all four languages.
- Running each program on the bad input prints the expected error to stderr and exits with 1.

## Measurements on my machine (B16)

The web sandbox's run is kept as `RUN-LOG-web-sandbox.txt`. Everything below was run again on my own machine:
Mac with Apple M3, 8 cores, 16 GB (Darwin arm64), OpenJDK 25.0.4.1, Python 3.14.2, Node.js v26.11.1, Apple clang 21.0.0, all on 2026-10-10.

- `RUN-LOG-mac.txt`: `sh run-all.sh` on my Mac for all 10 problems. 110/110 commands exit 0, all 40 outputs are identical to their `expected-output.txt`, and there are 0 compiler warnings with `-Wall -Wextra -pedantic`. `RUN-LOG-web-sandbox.txt` covers only the first two problems.
- `cpp-sanitizer-mac.txt`: all ten C++ test runners pass with `-fsanitize=address,undefined`, and macOS `leaks --atExit` reports 0 leaks. (ASan leak detection is not supported on macOS arm64, so leaks were checked with `leaks` instead.)
- `measure.py` produces `../data/cross_language.csv`, `timing-raw.csv`, `lizard-raw.txt` and one test log per program in `evidence/test_results/`. Run it from this folder, with JDK 25 first on `PATH` and lizard installed.

**Working folder.** Every command runs from its language folder, `Part3/<problem>/<language>/`, exactly as in that folder's README.

**Counting rule.**
- `source_loc` is lizard 1.24.1 "NLOC" summed over the production files only. Tests are excluded. Lines that are blank, comments or Python docstrings are not counted.
- `max_function_cc` is the highest lizard cyclomatic complexity of any production function: 1 + one per `if`/`for`/`while`/`case`/`catch`/`&&`/`||`/`?`.
- In every Composite version the maximum belongs to the input parser (`TreeParser.parse` / `parse`, CCN 17–24), not to the pattern classes. In every Observer version it belongs to the event-line `dispatch` method (CCN 7–10). The per-function numbers are in `lizard-raw.txt`.

**What the time includes.** `median_process_ms` is the wall-clock time of the whole program process:
- it includes start-up of the JVM, Python or Node runtime, reading the shared input file, the pattern work, and writing the output, which is captured, not printed;
- it was measured from Python with `time.perf_counter_ns()` around `subprocess.run`, after compiling (Java: `javac`; C++: `clang++ -std=c++20` without `-O`, as in the README);
- there was 1 warm-up run, then 5 measured runs, on the same machine and in the same session. The median of the 5 is reported, and all 6 raw times are in `timing-raw.csv`.

The differences are therefore dominated by runtime start-up, roughly Node > Java > Python > native C++, not by the pattern code.
