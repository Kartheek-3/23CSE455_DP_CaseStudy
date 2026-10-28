# Decorator in Python

Based on JUnit's D10 Timeout Invocation Wrappers (`SameThreadTimeoutInvocation`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/invocations.txt
python3 -m unittest -v test_decorator
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_decorator.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Decorator-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `decorator.py` | `Invocation` ABC (component), `TestInvocation`, `InvocationDecorator`, `TimeoutInvocation`, `LoggingInvocation`, parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- `Invocation` is an ABC with three abstract methods; `InvocationDecorator` forwards them, as in Java.
- A decorator here is a class, not Python's `@decorator` syntax: `@` decorates functions at definition time, whereas this pattern wraps objects at run time.
- The summary keeps insertion order because `dict` preserves it.
