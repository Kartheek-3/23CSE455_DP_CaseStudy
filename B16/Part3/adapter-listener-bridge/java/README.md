# Adapter in Java

Based on JUnit's B7 Engine-to-Launcher Listener Adapter (`ExecutionListenerAdapter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/adapter/*.java test/adapter/*.java
java -cp out adapter.AdapterDemo ../test-data/events.txt
java -cp out adapter.AdapterTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out adapter.AdapterDemo ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/adapter/AdapterTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Adapter-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `EngineListener.java` | Target (what the engine calls) |
| `TestListener.java` | Adaptee (client interface, `default` no-ops) |
| `ListenerAdapter.java` | Adapter |
| `PrintingTestListener.java` | Concrete client listener |
| `TestIdentifier.java` | Converted value (record) |
| `AdapterDemo.java` | Engine side (`runEngine`), parsing, `main` |

## How the pattern comes out in Java

- Target and adaptee are two separate interfaces; the adapter `implements` the target and holds the adaptee (object adapter), exactly like JUnit's `ExecutionListenerAdapter`.
- `TestIdentifier` is a `record`, so the test can compare it with `equals` directly.
- Unique ids are parsed with `java.util.regex`.
