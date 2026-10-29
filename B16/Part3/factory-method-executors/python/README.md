# Factory Method in Python

Based on JUnit's B2 Engine Collaborator Factory Methods (`HierarchicalTestEngine.createExecutorService`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/tests.txt
python3 -m unittest -v test_factory
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_factory.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Factory Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `factory.py` | `TestEngine` (creator, abstract `create_executor`), two concrete engines, `Executor` (product) and two concrete products, parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- `create_executor` is an `@abstractmethod`; Python classes are also callable factories, so an engine could store a class instead, but the subclass form matches the pattern.
- The product is an ABC with `describe` and `run`.
- `execute` returns plain lines so all languages can compare them.
