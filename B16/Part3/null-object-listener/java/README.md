# Null Object in Java

Based on JUnit's C7 No-op Listeners (`EngineExecutionListener.NOOP`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/nullobject/*.java test/nullobject/*.java
java -cp out nullobject.NullObjectDemo ../test-data/tests.txt
java -cp out nullobject.NullObjectTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out nullobject.NullObjectDemo ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/nullobject/NullObjectTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Null Object-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `TestListener.java` | Listener interface with the `NOOP` constant (null object) |
| `ConsoleListener.java` | Real listener |
| `TestRunner.java` | Client: never checks for null |
| `NullObjectDemo.java` | Parsing, wiring, `main` |

## How the pattern comes out in Java

- The null object is a lambda stored as an interface constant, `TestListener.NOOP`, exactly where JUnit puts `EngineExecutionListener.NOOP`.
- The no-argument constructor delegates to `this(TestListener.NOOP)`, so `listener` is never null.
- The test checks identity (`==`) with the shared constant.
