# Adapter – Sensor Driver Adaptation (java)

The production code is in `AbstractInput.java`; the test runner is in `SensorDriverTest.java`. The runner reads the shared cases
`../../test-cases/sensor_driver_cases.csv`, and the problem is defined in `../../test-cases/SPEC.md`.

- **Working folder:** `Part3\adapter_sensor_driver\java` (run every command from this folder, so that the relative CSV path works)
- **Toolchain:** OpenJDK 21.0.2 (javac 21.0.2). Put JDK 21 first on PATH (or set JAVA_HOME for the tools); an older `java` on PATH will not work
- **Standard library only.**

## Compile / run / test

```
javac -d out AbstractInput.java SensorDriverTest.java
java -cp out SensorDriverTest
```

Compile once, then run. The `out` folder holds the compiled classes.

The runner exits with code 0 when all cases pass and 1 otherwise. Expected final line:

```
Adapter tests: 12/12 passed
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
