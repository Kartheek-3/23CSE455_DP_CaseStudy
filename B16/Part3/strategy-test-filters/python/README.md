# Strategy in Python

Based on JUnit's A3 Post-Discovery Filter Policies (`PostDiscoveryFilter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/tests.txt
python3 -m unittest -v test_strategy
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_strategy.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Strategy-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `strategy.py` | `TestFilter` ABC (strategy), `IncludeTag`/`ExcludeTag`/`NameContains` (concrete strategies), `TestSelector` (context), parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- `TestFilter` is an `abc.ABC`; a subclass that forgets `includes` or `describe` cannot be instantiated, but this is checked at run time, not compile time.
- The selector only calls `includes()`, so any object with that method would work (duck typing); the ABC documents the contract.
- Lists are filtered with a comprehension instead of a stream.
