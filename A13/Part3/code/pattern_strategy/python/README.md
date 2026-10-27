# Strategy: Python

- Production code: `log_manager.py`
- Test runner: `test_log_manager.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_strategy/python/`:

```
python3 -B test_log_manager.py ../../../test-cases/strategy.txt
```

**Language notes:** `LogBackend` is a `typing.Protocol` used as documentation; backends do not inherit from it and nothing is enforced at runtime, so a backend without `write` only fails when called.
