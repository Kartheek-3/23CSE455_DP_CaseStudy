# Observer: JavaScript

- Production code: `preferencesManager.js`
- Test runner: `preferencesManager.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_observer/javascript/`:

```
node preferencesManager.test.js ../../../test-cases/observer.txt
```

**Language notes:** The subject extends Node's built-in `EventEmitter`, so `on`/`off`/`emit` come from the runtime (the TypeScript source uses EventEmitter3 the same way). `off` with an undefined listener throws a TypeError, so the test passes a never-registered function for the unknown-listener case.
