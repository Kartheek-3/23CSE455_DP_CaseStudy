# Dependency Injection — JavaScript

Run (from this directory):

```
node test_dependency_injection.js
```

Expected output: `DEPENDENCY_INJECTION_JS PASS 6/6`.

- Production snippet: `notification_service.js` (43 LOC).
- Test file: `test_dependency_injection.js` (kept separate from the snippet).
- Runtime: Node.js v24.18.0.
- max_function_cc: 1 (counted with the rule in `../evidence/README.md`).
- Timing rule: one warm-up run discarded, then five measured runs; the reported
  median (80.494 ms) is whole-process wall time, i.e. Node.js startup + program
  execution.
- Raw evidence: `../evidence/DependencyInjection_javascript.txt`.
