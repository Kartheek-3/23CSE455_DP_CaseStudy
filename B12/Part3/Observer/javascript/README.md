# Observer — JavaScript

Run (from this directory):

```
node test_observer.js
```

Expected output: `OBSERVER_JS PASS 8/8`.

- Production snippet: `occupancy_observer.js` (56 LOC).
- Test file: `test_observer.js` (kept separate from the snippet).
- Runtime: Node.js v24.18.0.
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (75.321 ms) is whole-process wall time, i.e. Node.js startup + program
  execution.
- Raw evidence: `../evidence/Observer_javascript.txt`.
