# Cache-Aside: JavaScript

- Production code: `federatedInstanceService.js`
- Test runner: `federatedInstanceService.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_cache_aside/javascript/`:

```
node federatedInstanceService.test.js ../../../test-cases/cache_aside.txt
```

**Language notes:** `Map` with `null` for known-missing; `fetchOrRegister` uses a truthiness check, so a cached null counts as a miss there, as in the source's `if (cached)`.
