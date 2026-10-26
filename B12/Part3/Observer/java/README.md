# Observer — Java

Compile and run (from this directory):

```
javac OccupancyObserver.java ObserverTest.java
java ObserverTest
```

Expected output: `OBSERVER_JAVA PASS 8/8`.

- Production snippet: `OccupancyObserver.java` (44 LOC). The interface is public
  and matches the file name; the supporting observer/monitor classes are
  package-private in the same file.
- Test file: `ObserverTest.java` (kept separate from the snippet).
- Runtime: javac / java 17.0.18 (OpenJDK).
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (159.106 ms) is whole-process wall time, dominated by
  JVM startup.
- Raw evidence: `../evidence/Observer_java.txt`.
