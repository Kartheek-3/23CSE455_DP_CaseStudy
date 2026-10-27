# State — JavaScript

Run (from this directory):

```
node test_state.js
```

Expected output: `STATE_JS PASS 13/13`.

- Production snippet: `ev_charging_state.js` (94 LOC).
- Test file: `test_state.js` (kept separate from the snippet).
- Runtime: Node.js v24.18.0.
- max_function_cc: 1 (polymorphism removes all branch points; rule in
  `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (73.154 ms) is whole-process wall time (Node.js startup + execution).
- Raw evidence: `../evidence/State_javascript.txt`.
