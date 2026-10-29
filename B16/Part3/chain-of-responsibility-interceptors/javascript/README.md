# Chain of Responsibility in JavaScript

Based on JUnit's D9 Invocation Interceptor Chain (`InvocationInterceptorChain`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/invocations.txt
node --test test/chain.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/chain.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Chain of Responsibility-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/chain.js` | three handlers, `runChain` (links), `Invocation` (request), parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- Handlers are any objects with `label` and `intercept`; `label` is a class field.
- `proceed` is an arrow function closing over the next link.
- The test reorders the chain to show that a handler can stop it early.
