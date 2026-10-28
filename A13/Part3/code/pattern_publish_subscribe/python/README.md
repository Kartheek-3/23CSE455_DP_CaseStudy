# Publish-Subscribe: Python

- Production code: `event_bus.py`
- Test runner: `test_event_bus.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_publish_subscribe/python/`:

```
python3 -B test_event_bus.py ../../../test-cases/publish_subscribe.txt
```

**Language notes:** Handlers are callables; the message is built with `json.dumps` using compact separators.
