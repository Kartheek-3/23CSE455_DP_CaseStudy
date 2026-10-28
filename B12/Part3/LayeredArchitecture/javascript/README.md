# Layered Architecture — JavaScript

Run (from this directory):

```
node test_layered_architecture.js
```

Expected output: `LAYERED_ARCHITECTURE_JS PASS 8/8`.

- Production snippet: `layered_architecture.js` (51 LOC).
- Test file: `test_layered_architecture.js` (kept separate from the snippet).
- Runtime: Node.js v24.18.0.
- max_function_cc: 2 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (74.698 ms) is whole-process wall time, i.e. Node.js startup + program
  execution.
- Raw evidence: `../evidence/LayeredArchitecture_javascript.txt`.
