# Proxy: JavaScript

- Production code: `analyticsProxy.js`
- Test runner: `analyticsProxy.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_proxy/javascript/`:

```
node analyticsProxy.test.js ../../../test-cases/proxy.txt
```

**Language notes:** `?.` and `??` make each forwarded call one line, as in the TypeScript source. Side effect: a real object that returns `null` or `undefined` would also be replaced by the no-op value.
