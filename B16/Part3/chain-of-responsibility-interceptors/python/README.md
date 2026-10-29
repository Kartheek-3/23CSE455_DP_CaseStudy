# Chain of Responsibility in Python

Based on JUnit's D9 Invocation Interceptor Chain (`InvocationInterceptorChain`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/invocations.txt
python3 -m unittest -v test_chain
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_chain.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Chain of Responsibility-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `chain.py` | `Interceptor` ABC (handler), three concrete handlers, `run_chain` (links), `Invocation` (request), parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- `proceed` is a `lambda` closing over the next index, so each link is created on demand.
- Handlers are classes with an abstract `intercept`; plain functions would also work.
- The trace list on the request records which links ran.
