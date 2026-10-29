# State — Python

Run (from this directory):

```
python test_state.py
```

Expected output: `STATE_PY PASS 13/13`.

- Production snippet: `ev_charging_state.py` (57 LOC).
- Test file: `test_state.py` (kept separate from the snippet).
- Runtime: Python 3.13.7.
- max_function_cc: 1 (polymorphism removes all branch points; rule in
  `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (67.420 ms) is whole-process wall time (interpreter startup + execution).
- Raw evidence: `../evidence/State_python.txt`.
