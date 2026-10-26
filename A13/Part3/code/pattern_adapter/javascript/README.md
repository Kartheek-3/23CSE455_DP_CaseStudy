# Adapter: JavaScript

- Production code: `telemetry.js`
- Test runner: `telemetry.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_adapter/javascript/`:

```
node telemetry.test.js ../../../test-cases/adapter.txt
```

**Language notes:** Neither Target nor Adaptee is declared; the registry and adapter agree only through method names, so a typo shows up at call time.
