# Active Record – User and Role Persistence (python)

The production code is in `user_role.py`; the test runner is in `test_user_role.py`. The runner reads the shared cases
`../../test-cases/user_role_cases.csv`, and the problem is defined in `../../test-cases/SPEC.md`.

- **Working folder:** `Part3\active_record_user_role\python` (run every command from this folder, so that the relative CSV path works)
- **Toolchain:** Python 3.12.7 (python on PATH)
- **Standard library only.**

## Compile / run / test

```
python test_user_role.py
```

No compile step.

The runner exits with code 0 when all cases pass and 1 otherwise. Expected final line:

```
Active Record tests: 12/12 passed
```

## Measurement rules (identical for every language)

- **source_loc** and **max_function_cc**: lizard 1.24.1 is run on the PRODUCTION file only.
  - `source_loc` = lizard NLOC for that file (excludes blank lines and comments).
  - `max_function_cc` = the highest CCN of any function in that file.
  - lizard's raw output is saved in `Part3/evidence/lizard_<pattern>.txt`.
- **Timing**: compile first (javac / `g++ -std=c++14 -O2`) outside the timed runs. Then run the test-runner
  process once as a warmup and five more times as measured runs on the same machine, with
  `Part3/tools/measure.py` (`time.perf_counter` around `subprocess.run`). The reported value is the
  median of the five measured runs, in milliseconds.
- The measured time is the whole test-runner process: interpreter/JVM startup, reading the CSV and running
  all test cases. Every individual run time is saved in `Part3/evidence/timings_<pattern>.txt`.
- Only measured values are reported; nothing is estimated or rounded up.
