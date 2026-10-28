# Decorator in Java

Based on JUnit's D10 Timeout Invocation Wrappers (`SameThreadTimeoutInvocation`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/decorator/*.java test/decorator/*.java
java -cp out decorator.DecoratorDemo ../test-data/invocations.txt
java -cp out decorator.DecoratorTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out decorator.DecoratorDemo ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/decorator/DecoratorTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Decorator-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `Invocation.java` | Component interface |
| `TestInvocation.java` | Concrete component (record) |
| `InvocationDecorator.java` | Base decorator (abstract, forwards) |
| `TimeoutInvocation.java`, `LoggingInvocation.java` | Concrete decorators |
| `DecoratorDemo.java` | Parsing, wiring, `main` |

## How the pattern comes out in Java

- Decorators and the component share the `Invocation` interface, so they can be nested in any order; the test shows the opposite nesting (`Timeout(Logging(...))`).
- The abstract `InvocationDecorator` forwards every method, so each concrete decorator overrides only `proceed()`.
- The wrapped object is a `final` field set in the constructor.
