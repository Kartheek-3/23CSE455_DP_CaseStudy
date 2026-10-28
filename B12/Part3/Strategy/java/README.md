# Strategy — Java

Compile and run (from this directory):

```
javac SlotAllocationStrategy.java StrategyTest.java
java StrategyTest
```

Expected output: `STRATEGY_JAVA PASS 5/5`.

- Production snippet: `SlotAllocationStrategy.java` (77 LOC). The interface is
  public and matches the file name; the supporting classes are package-private in
  the same file.
- Test file: `StrategyTest.java` (kept separate from the snippet).
- Runtime: javac / java 17.0.18 (OpenJDK).
- max_function_cc: 7 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (185.646 ms) is whole-process wall time, dominated by
  JVM startup.
- Raw evidence: `../evidence/Strategy_java.txt`.
