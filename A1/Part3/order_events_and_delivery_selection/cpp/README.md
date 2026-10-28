# C++ demonstration — Observer and Strategy (combined program)

**Source file:** `design_patterns.cpp` — the team's original demonstration, copied unchanged from `DP.zip` (SHA-256 `00a89d8ec88fd5b3b1850bf7ab010e7526087463924fe371722a66d38c4668dc`, matching `data/provenance/demonstrations-before.json`).

**Runtime/compiler used for the recorded results:** g++ 13.3.0 (Ubuntu 13.3.0-6ubuntu2~24.04.1), default flags as in the team's recorded command (see `Part3/evidence/toolchain_versions.txt`).

## Run the program
From this folder:

```bash
g++ design_patterns.cpp -o /tmp/design_patterns && /tmp/design_patterns
```

## Run the tests
```bash
bash run_tests.sh
```

`run_tests.sh` compiles with the team's recorded `g++` command into a temporary directory (no binary is kept), runs the program and pipes its standard output to the shared black-box checker `Part3/tools/check_output.py`, which compares it with `Part3/test-cases/cases.json` and `expected_output.txt` (5 line cases plus one whole-output case). The recorded result is in `Part3/evidence/test_cpp.log`: Observer 3/3, Strategy 2/2, full output 1/1, exit 0.

## Scope and limitations
- Observer and Strategy are in one program, so the measured process time (`Part3/evidence/timing_summary.csv`) covers both sections. No separate per-pattern timing exists.
- The program hard-codes one fixture. The "no available partner" branch is not executed by the tests.
- The demonstration is a simplified model, not a translation of the Django code: its Observer keeps the observer list inside `Order` (the application uses Django Channels groups), and its Strategy uses `available`/`priority` attributes that do not exist in the application's `DeliveryPerson` model.
