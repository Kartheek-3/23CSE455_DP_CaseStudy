# Plugin Architecture: Python

- Production code: `plugin_host.py`
- Test runner: `test_plugin_host.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_plugin_architecture/python/`:

```
python3 -B test_plugin_host.py ../../../test-cases/plugin_architecture.txt
```

**Language notes:** `setup` receives an `add_handler` closure; handlers are plain callables stored in tuples.
