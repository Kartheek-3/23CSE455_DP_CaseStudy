# Layered Architecture — Java

Compile and run (from this directory):

```
javac ReservationRepository.java LayeredArchitectureTest.java
java LayeredArchitectureTest
```

Expected output: `LAYERED_ARCHITECTURE_JAVA PASS 8/8`.

- Production snippet: `ReservationRepository.java` (53 LOC). The data-layer class
  is public and matches the file name; the model, business-layer and
  presentation-layer classes are package-private in the same file.
- Test file: `LayeredArchitectureTest.java` (kept separate from the snippet).
- Runtime: javac / java 17.0.18 (OpenJDK).
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (148.051 ms) is whole-process wall time, dominated by
  JVM startup.
- Raw evidence: `../evidence/LayeredArchitecture_java.txt`.
