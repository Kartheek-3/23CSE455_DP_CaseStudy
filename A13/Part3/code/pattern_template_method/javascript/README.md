# Template Method: JavaScript

- Production code: `chart.js`
- Test runner: `chart.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_template_method/javascript/`:

```
node chart.test.js ../../../test-cases/template_method.txt
```

**Language notes:** No abstract keyword: the base hooks throw when called, and `tick` can be overridden freely. Errors from a missing hook appear only at run time.
