# Router: JavaScript

- Production code: `nirax.js`
- Test runner: `nirax.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_router/javascript/`:

```
node nirax.test.js ../../../test-cases/router.txt
```

**Language notes:** Object spread builds the modified result; path pieces come from `split` and destructuring defaults.
