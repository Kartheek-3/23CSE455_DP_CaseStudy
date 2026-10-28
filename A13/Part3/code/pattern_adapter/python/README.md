# Adapter: Python

- Production code: `telemetry.py`
- Test runner: `test_telemetry.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_adapter/python/`:

```
python3 -B test_telemetry.py ../../../test-cases/adapter.txt
```

**Language notes:** The Target is an ABC, but the Sentry SDK shape is not declared anywhere; the adapter is handed any object with matching methods. Options are a plain dict.
