# Strategy — JavaScript

Run (from this directory):

```
node test_strategy.js
```

Expected output: `STRATEGY_JS PASS 5/5`.

- Production snippet: `slot_allocation_strategy.js` (75 LOC).
- Test file: `test_strategy.js` (kept separate from the snippet).
- Runtime: Node.js v24.18.0.
- max_function_cc: 5 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (80.866 ms) is whole-process wall time, i.e. Node.js startup + program
  execution.
- Raw evidence: `../evidence/Strategy_javascript.txt`.
