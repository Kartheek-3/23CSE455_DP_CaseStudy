# Factory: JavaScript

- Production code: `loggingFactory.js`
- Test runner: `loggingFactory.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_factory/javascript/`:

```
node loggingFactory.test.js ../../../test-cases/factory.txt
```

**Language notes:** A module-level function; `format == null` also matches `undefined`. Products have no declared common interface.
