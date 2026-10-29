# Service Layer: Python

- Production code: `announcement_service.py`
- Test runner: `test_announcement_service.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_service_layer/python/`:

```
python3 -B test_announcement_service.py ../../../test-cases/service_layer.txt
```

**Language notes:** The entity is a dataclass and collaborators are duck-typed objects; `LookupError` stands for the not-found error.
