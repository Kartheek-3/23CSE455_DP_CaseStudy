# Two-Level Cache: Python

- Production code: `redis_single_cache.py`
- Test runner: `test_redis_single_cache.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_two_level_cache/python/`:

```
python3 -B test_redis_single_cache.py ../../../test-cases/two_level_cache.txt
```

**Language notes:** Absent is `None`; the Redis object and the clock are plain duck-typed collaborators.
