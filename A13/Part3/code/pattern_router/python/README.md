# Router: Python

- Production code: `nirax.py`
- Test runner: `test_nirax.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_router/python/`:

```
python3 -B test_nirax.py ../../../test-cases/router.txt
```

**Language notes:** `Resolved` is a `namedtuple` and `_replace` creates the login-required variant; matching uses `for ... else`.
