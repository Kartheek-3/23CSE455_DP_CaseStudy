# Cache-Aside: Python

- Production code: `federated_instance_service.py`
- Test runner: `test_federated_instance_service.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_cache_aside/python/`:

```
python3 -B test_federated_instance_service.py ../../../test-cases/cache_aside.txt
```

**Language notes:** A dict holding `None` for known-missing hosts, so `has` is needed; the entity is a `namedtuple`.
