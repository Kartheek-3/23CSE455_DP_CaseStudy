# Command in JavaScript

Based on JUnit's B9 Node Execution Tasks (`NodeTestTask` / `TestTask`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/tasks.txt
node --test test/command.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/tasks.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/command.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Command-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/command.js` | `RunTestCommand`, `NoteCommand`, `TaskExecutor` (invoker, `#queue`), parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- There is no interface: any object with `execute(results)` is a command.
- The executor's queue is a `#private` field, so commands can only be added through `submit`.
- `runAll` maps the queue to lines in one expression.
