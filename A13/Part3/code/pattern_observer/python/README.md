# Observer: Python

- Production code: `preferences_manager.py`
- Test runner: `test_preferences_manager.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_observer/python/`:

```
python3 -B test_preferences_manager.py ../../../test-cases/observer.txt
```

**Language notes:** A plain list of callables with a `namedtuple` event; single event type, no event names. Notification iterates over a copy of the list.
