# Java demonstration — Observer and Strategy (combined program)

**Source file:** `DesignPatterns.java` — the team's original demonstration, copied unchanged from `DP.zip` (SHA-256 `6f854b4f7350b0988299d194e454cf64bbe566e4e15f7ac1cd90f401e6809b7c`, matching `data/provenance/demonstrations-before.json`).

**Runtime/compiler used for the recorded results:** OpenJDK 21.0.12.1 (javac 21.0.12.1) (see `Part3/evidence/toolchain_versions.txt`).

## Run the program
From this folder:

```bash
javac -d /tmp/a1_java DesignPatterns.java && java -cp /tmp/a1_java DesignPatterns
```

## Run the tests
```bash
bash run_tests.sh
```

`run_tests.sh` compiles into a temporary directory (no .class files are kept), runs the program and pipes its standard output to the shared black-box checker `Part3/tools/check_output.py`, which compares it with `Part3/test-cases/cases.json` and `expected_output.txt` (5 line cases plus one whole-output case). The recorded result is in `Part3/evidence/test_java.log`: Observer 3/3, Strategy 2/2, full output 1/1, exit 0.

## Scope and limitations
- Observer and Strategy are in one program, so the measured process time (`Part3/evidence/timing_summary.csv`) covers both sections. No separate per-pattern timing exists.
- The program hard-codes one fixture. The "no available partner" branch is not executed by the tests.
- The demonstration is a simplified model, not a translation of the Django code: its Observer keeps the observer list inside `Order` (the application uses Django Channels groups), and its Strategy uses `available`/`priority` attributes that do not exist in the application's `DeliveryPerson` model.
