# Factory Method in Java

Based on JUnit's B2 Engine Collaborator Factory Methods (`HierarchicalTestEngine.createExecutorService`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/factory/*.java test/factory/*.java
java -cp out factory.FactoryDemo ../test-data/tests.txt
java -cp out factory.FactoryTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out factory.FactoryDemo ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/factory/FactoryTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Factory Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `TestEngine.java` | Creator: `execute` + abstract factory method `createExecutor` |
| `SameThreadEngine.java`, `PooledEngine.java` | Concrete creators |
| `Executor.java` | Product interface |
| `SameThreadExecutor.java`, `PooledExecutor.java` | Concrete products |
| `FactoryDemo.java` | Parsing, wiring, `main` |

## How the pattern comes out in Java

- `execute` is written once in the abstract creator and calls the abstract `createExecutor`; subclasses only decide which product is created, as JUnit's `JupiterTestEngine` does.
- The product is an interface, so `execute` never names a concrete executor.
- The test creates a new engine with a 3-worker pool by overriding only the factory method.
