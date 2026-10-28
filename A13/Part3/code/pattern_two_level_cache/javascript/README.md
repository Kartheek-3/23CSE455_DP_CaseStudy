# Two-Level Cache: JavaScript

- Production code: `redisSingleCache.js`
- Test runner: `redisSingleCache.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_two_level_cache/javascript/`:

```
node redisSingleCache.test.js ../../../test-cases/two_level_cache.txt
```

**Language notes:** Absent is `undefined`, as in the TypeScript source; synchronous here, where the source awaits Redis.
