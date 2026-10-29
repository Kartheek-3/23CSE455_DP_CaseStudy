# Repository: Python

- Production code: `repository.py`
- Test runner: `test_repository.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_repository/python/`:

```
python3 -B test_repository.py ../../../test-cases/repository.txt
```

**Language notes:** `MiRepository` is a mixin listed before `InMemoryRepository` in the bases, so its `insert_one` calls the other base's `insert` and `find_one_or_fail`.
