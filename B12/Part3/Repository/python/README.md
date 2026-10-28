# Repository — Python

Run (from this directory):

```
python test_repository.py
```

Expected output: `REPOSITORY_PY PASS 8/8`.

- Production snippet: `user_repository.py` (43 LOC).
- Test file: `test_repository.py` (kept separate from the snippet).
- Runtime: Python 3.13.7.
- max_function_cc: 1 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (104.625 ms) is whole-process wall time, i.e. interpreter startup +
  program execution.
- Raw evidence: `../evidence/Repository_python.txt`.
