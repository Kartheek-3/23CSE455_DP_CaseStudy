# Adapter in Python

Based on JUnit's B7 Engine-to-Launcher Listener Adapter (`ExecutionListenerAdapter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/events.txt
python3 -m unittest -v test_adapter
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_adapter.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Adapter-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `adapter.py` | `EngineListener` (target), `TestListener` (adaptee), `ListenerAdapter` (adapter), `PrintingTestListener`, engine side and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- The adapter subclasses the target class, but the engine would accept any object with `execution_started`/`execution_finished` (duck typing).
- The parent name is `None` for the root, so `describe()` uses a conditional expression.
- Regular expressions come from the `re` module.
