# Layered Architecture — Python

Run (from this directory):

```
python test_layered_architecture.py
```

Expected output: `LAYERED_ARCHITECTURE_PY PASS 8/8`.

- Production snippet: `layered_architecture.py` (34 LOC).
- Test file: `test_layered_architecture.py` (kept separate from the snippet).
- Runtime: Python 3.13.7.
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (89.697 ms) is whole-process wall time, i.e. interpreter startup +
  program execution.
- Raw evidence: `../evidence/LayeredArchitecture_python.txt`.
