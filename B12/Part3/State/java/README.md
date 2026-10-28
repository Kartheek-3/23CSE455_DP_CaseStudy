# State — Java

Compile and run (from this directory):

```
javac EvChargingState.java StateTest.java
java StateTest
```

Expected output: `STATE_JAVA PASS 13/13`.

- Production snippet: `EvChargingState.java` (83 LOC). The interface is public and
  matches the file name; states and the context are package-private in the same
  file.
- Test file: `StateTest.java` (kept separate from the snippet).
- Runtime: javac / java 17.0.18 (OpenJDK).
- max_function_cc: 1 (polymorphism removes all branch points; rule in
  `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (173.178 ms) is whole-process wall time, dominated by
  JVM startup.
- Raw evidence: `../evidence/State_java.txt`.
