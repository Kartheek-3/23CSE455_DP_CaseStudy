# Repository: JavaScript

- Production code: `repository.js`
- Test runner: `repository.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_repository/javascript/`:

```
node repository.test.js ../../../test-cases/repository.txt
```

**Language notes:** `extend(repository, miRepository)` copies the method onto the instance, like `.extend(miRepository)` in the TypeScript source.
