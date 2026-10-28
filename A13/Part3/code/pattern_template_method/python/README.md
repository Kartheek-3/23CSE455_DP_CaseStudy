# Template Method: Python

- Production code: `chart.py`
- Test runner: `test_chart.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_template_method/python/`:

```
python3 -B test_chart.py ../../../test-cases/template_method.txt
```

**Language notes:** An ABC with `@abstractmethod` hooks; instantiating `Chart` directly raises `TypeError`, but nothing stops a subclass from overriding `tick`.
