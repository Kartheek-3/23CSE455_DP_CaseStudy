# Observer — Python

Run (from this directory):

```
python test_observer.py
```

Expected output: `OBSERVER_PY PASS 8/8`.

- Production snippet: `occupancy_observer.py` (33 LOC).
- Test file: `test_observer.py` (kept separate from the snippet).
- Runtime: Python 3.13.7.
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (65.179 ms) is whole-process wall time, i.e. interpreter startup +
  program execution.
- Raw evidence: `../evidence/Observer_python.txt`.
