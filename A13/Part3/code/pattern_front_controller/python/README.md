# Front Controller: Python

- Production code: `api_controller.py`
- Test runner: `test_api_controller.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_front_controller/python/`:

```
python3 -B test_api_controller.py ../../../test-cases/front_controller.txt
```

**Language notes:** `Endpoint` is a `namedtuple` and the authenticator any callable returning a user or `None`.
