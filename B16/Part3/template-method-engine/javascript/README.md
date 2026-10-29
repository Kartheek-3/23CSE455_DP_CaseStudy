# Template Method in JavaScript

Based on JUnit's B1 Hierarchical Engine Execution Skeleton (`HierarchicalTestEngine.execute`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/tests.txt
node --test test/template.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/template.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Template Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/template.js` | `TestEngine` (abstract by convention), `SimpleEngine`, `LifecycleEngine`, parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- There is no `final` and no `abstract`: the base class throws from `name()`/`runTest()` if a subclass forgets them, and overriding `execute` is only discouraged.
- Hooks are empty methods, as in the other languages.
- The test defines a subclass inline with `class ... extends TestEngine`.
