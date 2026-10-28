# Null Object in JavaScript

Based on JUnit's C7 No-op Listeners (`EngineExecutionListener.NOOP`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/tests.txt
node --test test/nullobject.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/nullobject.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Null Object-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/nullobject.js` | frozen `NOOP` object (null object), `ConsoleListener`, `TestRunner` (default parameter), parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- `NOOP` is a frozen object literal, so nobody can add behaviour to the shared instance.
- A default parameter (`listener = NOOP`) replaces both `null` and `undefined` checks.
- Any object with `testFinished` can be a listener.
