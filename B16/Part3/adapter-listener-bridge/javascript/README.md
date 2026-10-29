# Adapter in JavaScript

Based on JUnit's B7 Engine-to-Launcher Listener Adapter (`ExecutionListenerAdapter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/events.txt
node --test test/adapter.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/adapter.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Adapter-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/adapter.js` | `EngineListener` (target), `TestListener` (adaptee), `ListenerAdapter` (adapter), engine side and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- The test passes a plain object with only `testFinished` as the client listener; the adapter calls only what exists, so duck typing replaces the interface.
- `toIdentifier` uses `matchAll` and `Array.prototype.at(-1)`.
- The adaptee is a `#private` field of the adapter.
