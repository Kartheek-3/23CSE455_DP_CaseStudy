# Dependency Injection — Python

Run (from this directory):

```
python test_dependency_injection.py
```

Expected output: `DEPENDENCY_INJECTION_PY PASS 6/6`.

- Production snippet: `notification_service.py` (25 LOC).
- Test file: `test_dependency_injection.py` (kept separate from the snippet).
- Runtime: Python 3.13.7.
- max_function_cc: 1 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (45.405 ms) is whole-process wall time, i.e. interpreter startup +
  program execution.
- Raw evidence: `../evidence/DependencyInjection_python.txt`.
