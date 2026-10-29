# Null Object in Python

Based on JUnit's C7 No-op Listeners (`EngineExecutionListener.NOOP`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/tests.txt
python3 -m unittest -v test_nullobject
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_nullobject.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Null Object-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `nullobject.py` | `TestListener`, `NoOpListener` + module constant `NOOP` (null object), `ConsoleListener`, `TestRunner`, parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- The default argument `listener=NOOP` is safe here because `NOOP` is a stateless shared instance (a mutable default would be a bug).
- `None` is avoided entirely; the runner just calls the method.
- The test checks identity with `assertIs`.
