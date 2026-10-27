# Template Method in Python

Based on JUnit's B1 Hierarchical Engine Execution Skeleton (`HierarchicalTestEngine.execute`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/tests.txt
python3 -m unittest -v test_template
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_template.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Template Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `template.py` | `TestEngine` ABC (template method `execute`, abstract `run_test`, hooks), `SimpleEngine`, `LifecycleEngine`, parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- Python has no `final` for methods at run time (`typing.final` is only a hint for type checkers), so the fixed skeleton is a convention.
- `run_test` is an `@abstractmethod`; hooks are normal methods with empty bodies.
- A subclass could still override `execute`; nothing stops it.
