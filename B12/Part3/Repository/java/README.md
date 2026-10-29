# Repository — Java

Compile and run (from this directory):

```
javac UserRepository.java RepositoryTest.java
java RepositoryTest
```

Expected output: `REPOSITORY_JAVA PASS 8/8`.

- Production snippet: `UserRepository.java` (56 LOC). The interface is public and
  matches the file name; the model, in-memory implementation and service are
  package-private in the same file.
- Test file: `RepositoryTest.java` (kept separate from the snippet).
- Runtime: javac / java 17.0.18 (OpenJDK).
- max_function_cc: 1 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (143.415 ms) is whole-process wall time, dominated by
  JVM startup.
- Raw evidence: `../evidence/Repository_java.txt`.
