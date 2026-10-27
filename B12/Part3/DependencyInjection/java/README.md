# Dependency Injection — Java

Compile and run (from this directory):

```
javac NotificationService.java DependencyInjectionTest.java
java DependencyInjectionTest
```

Expected output: `DEPENDENCY_INJECTION_JAVA PASS 6/6`.

- Production snippet: `NotificationService.java` (36 LOC). All types are
  package-private in this file (no public type), compiled together with the test.
- Test file: `DependencyInjectionTest.java` (kept separate from the snippet).
- Runtime: javac / java 17.0.18 (OpenJDK).
- max_function_cc: 1 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (141.076 ms) is whole-process wall time, dominated by
  JVM startup.
- Raw evidence: `../evidence/DependencyInjection_java.txt`.
