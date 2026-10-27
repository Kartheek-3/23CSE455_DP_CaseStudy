# Dependency Injection - CDI Field Injection Wiring (JavaScript)

Snippet of the confirmed instance **CDI Field Injection Wiring** (Dependency Injection) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/dependency_injection_wiring/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Container | `Container` | declared in `snippet.js` |
| ManagedBean | `Service` | declared in `snippet.js` |
| ManagedBean | `RealDao` | declared in `snippet.js` |
| ManagedBean | `FakeDao` | declared in `snippet.js` |
| Bean contract | `Bean` | declared in `snippet.js` |
