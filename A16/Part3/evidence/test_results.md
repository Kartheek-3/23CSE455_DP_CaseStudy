# Part 3 test results

All four Java and four C++ production programs compiled successfully. All eight language-pattern test runners passed.

| Pattern | Language | Test result | Program output |
|---|---|---|---|
| Strategy | Java | 2/2 expected values passed | `standard=9000;premium=8000` |
| Strategy | C++ | 2/2 expected values passed | `standard=9000;premium=8000` |
| Strategy | Python | 1/1 test passed; both values checked | `standard=9000;premium=8000` |
| Strategy | JavaScript | 2/2 expected values passed | `standard=9000;premium=8000` |
| Adapter | Java | 1/1 expected receipt passed | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` |
| Adapter | C++ | 1/1 expected receipt passed | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` |
| Adapter | Python | 1/1 test passed | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` |
| Adapter | JavaScript | 1/1 expected receipt passed | `status=APPROVED,amount_cents=2599,reference=legacy-25.99` |

The production command for each of the eight snippets was also launched once as warm-up and five times for timing. Every one of the 48 executions exited successfully and returned the expected output. Individual durations and outputs are recorded in `runtime_runs.md`.

Versions: OpenJDK/Javac 17.0.20.1; MinGW GCC 6.3.0-1 (C++17); Python 3.14.4; Node.js v24.15.0. Build files were generated under `Part3/.build/` for verification and are removed before submission.
