# Strategy: JavaScript

- Production code: `logManager.js`
- Test runner: `logManager.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_strategy/javascript/`:

```
node logManager.test.js ../../../test-cases/strategy.txt
```

**Language notes:** There is no interface at all: backends are plain classes with a `write` method (duck typing), so a missing method also only fails when called. `JSON.stringify` handles escaping here.
