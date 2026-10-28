# Strategy in Java

Based on JUnit's A3 Post-Discovery Filter Policies (`PostDiscoveryFilter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/strategy/*.java test/strategy/*.java
java -cp out strategy.StrategyDemo ../test-data/tests.txt
java -cp out strategy.StrategyTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out strategy.StrategyDemo ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/strategy/StrategyTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Strategy-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `TestFilter.java` | Strategy interface |
| `IncludeTag.java`, `ExcludeTag.java`, `NameContains.java` | Concrete strategies (records) |
| `TestSelector.java` | Context |
| `TestCase.java` | Test record |
| `StrategyDemo.java` | Parsing, wiring, `main` |

## How the pattern comes out in Java

- The strategy is an `interface` and the concrete strategies are `record`s: each is an immutable value with its parameter (`tag`, `text`) and the compiler checks every override.
- `TestSelector` uses `filter::includes` as a method reference in a stream, which is the same shape as JUnit's `Filter.toPredicate()`.
- The test plugs in an anonymous class the selector has never seen, showing that the context depends only on the interface.
