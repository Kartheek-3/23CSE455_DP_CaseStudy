# Template Method in Java

Based on JUnit's B1 Hierarchical Engine Execution Skeleton (`HierarchicalTestEngine.execute`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/template/*.java test/template/*.java
java -cp out template.TemplateDemo ../test-data/tests.txt
java -cp out template.TemplateTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out template.TemplateDemo ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/template/TemplateTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Template Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `TestEngine.java` | Abstract class with the `final` template method `execute`, primitive `runTest`, hooks |
| `SimpleEngine.java`, `LifecycleEngine.java` | Concrete classes |
| `TemplateDemo.java` | Parsing, wiring, `main` |

## How the pattern comes out in Java

- `execute` is `final`, so a subclass cannot change the order of the steps; this is the language-enforced form of the pattern, as in JUnit (`HierarchicalTestEngine.execute` is `final`).
- `runTest` is `abstract` (must be implemented); the hooks are ordinary methods with empty bodies (may be overridden).
- The test builds a new engine as an anonymous subclass that implements only the primitive.
