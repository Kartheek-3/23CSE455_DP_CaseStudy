# Factory Method in JavaScript

Based on JUnit's B2 Engine Collaborator Factory Methods (`HierarchicalTestEngine.createExecutorService`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/tests.txt
node --test test/factory.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/factory.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Factory Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/factory.js` | `TestEngine` (creator), two concrete engines, two executors (products), parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- The creator throws if `createExecutor()` is not overridden (no `abstract` in the language).
- Executors are any objects with `describe` and `run`.
- `report` uses `flatMap` over the two engines.
