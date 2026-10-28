# Decorator in JavaScript

Based on JUnit's D10 Timeout Invocation Wrappers (`SameThreadTimeoutInvocation`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `javascript/` folder; Node.js 26.11.1)

```sh
node src/main.js ../test-data/invocations.txt
node --test test/decorator.test.js
```

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/decorator.test.js`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Decorator-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `src/decorator.js` | `TestInvocation`, `InvocationDecorator` (getters forward), `TimeoutInvocation`, `LoggingInvocation`, parsing and `report` |
| `src/main.js` | Command line entry |

## How the pattern comes out in JavaScript

- There is no component interface; the decorators forward `name` and `durationMs` through getters, so callers cannot tell a decorator from the real invocation.
- The wrapped object is a public field (`inner`) so subclasses can reach it; the limit and log are `#private`.
- Nesting order is free, as shown in the test.
