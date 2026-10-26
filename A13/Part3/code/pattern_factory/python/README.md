# Factory: Python

- Production code: `logging_factory.py`
- Test runner: `test_logging_factory.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_factory/python/`:

```
python3 -B test_logging_factory.py ../../../test-cases/factory.txt
```

**Language notes:** A module-level function; `None` and `"pretty"` both give the pretty backend. Products are chosen by exact string comparison.
