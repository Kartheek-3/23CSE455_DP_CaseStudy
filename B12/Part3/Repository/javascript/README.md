# Repository — JavaScript

Run (from this directory):

```
node test_repository.js
```

Expected output: `REPOSITORY_JS PASS 8/8`.

- Production snippet: `user_repository.js` (58 LOC).
- Test file: `test_repository.js` (kept separate from the snippet).
- Runtime: Node.js v24.18.0.
- max_function_cc: 2 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (78.932 ms) is whole-process wall time, i.e. Node.js startup + program
  execution.
- Raw evidence: `../evidence/Repository_javascript.txt`.
