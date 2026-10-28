# Strategy in JavaScript

Based on JUnit's A3 Post-Discovery Filter Policies (`PostDiscoveryFilter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/tests.txt
node --test test/strategy.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/strategy.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Strategy-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/strategy.js` | `TestFilter` base (strategy), three concrete strategies, `TestSelector` (context), parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- There are no interfaces: `TestFilter` blocks `new TestFilter()` with `new.target` and throws if a subclass forgets a method, which is only noticed when it is called.
- The test passes a plain object `{ includes }` as a strategy and the selector accepts it: pure duck typing.
- Parameters are `#private` fields.
