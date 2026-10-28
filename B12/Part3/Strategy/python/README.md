# Strategy — Python

Run (from this directory):

```
python test_strategy.py
```

Expected output: `STRATEGY_PY PASS 5/5`.

- Production snippet: `slot_allocation_strategy.py` (49 LOC).
- Test file: `test_strategy.py` (kept separate from the snippet).
- Runtime: Python 3.13.7.
- max_function_cc: 6 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (112.122 ms) is whole-process wall time, i.e. interpreter startup +
  program execution.
- Raw evidence: `../evidence/Strategy_python.txt`.
