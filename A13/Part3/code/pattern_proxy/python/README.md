# Proxy: Python

- Production code: `analytics_proxy.py`
- Test runner: `test_analytics_proxy.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_proxy/python/`:

```
python3 -B test_analytics_proxy.py ../../../test-cases/proxy.txt
```

**Language notes:** Same shape as Java with an ABC as the shared interface; absence is `None` and the single-assignment rule raises `RuntimeError`.
