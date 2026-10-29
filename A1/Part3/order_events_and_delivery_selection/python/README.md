# Python demonstration — Observer and Strategy (combined program)

**Source file:** `design_patterns.py` — the team's original demonstration, copied unchanged from `DP.zip` (SHA-256 `9bf8d890a0d4920317202afe39f29df6afd7888936471327744a67bfd950e8ad`, matching `data/provenance/demonstrations-before.json`).

**Runtime/compiler used for the recorded results:** CPython 3.13.16 (see `Part3/evidence/toolchain_versions.txt`).

## Run the program
From this folder:

```bash
python3 design_patterns.py
```

## Run the tests
```bash
bash run_tests.sh
```

`run_tests.sh` runs the program and pipes its standard output to the shared black-box checker `Part3/tools/check_output.py`, which compares it with `Part3/test-cases/cases.json` and `expected_output.txt` (5 line cases plus one whole-output case). The recorded result is in `Part3/evidence/test_python.log`: Observer 3/3, Strategy 2/2, full output 1/1, exit 0.

## Scope and limitations
- Observer and Strategy are in one program, so the measured process time (`Part3/evidence/timing_summary.csv`) covers both sections. No separate per-pattern timing exists.
- The program hard-codes one fixture. The "no available partner" branch is not executed by the tests.
- The demonstration is a simplified model, not a translation of the Django code: its Observer keeps the observer list inside `Order` (the application uses Django Channels groups), and its Strategy uses `available`/`priority` attributes that do not exist in the application's `DeliveryPerson` model.
