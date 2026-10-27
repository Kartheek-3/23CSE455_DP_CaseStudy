# Dependency Injection - CDI Field Injection Wiring (Python)

Snippet of the confirmed instance **CDI Field Injection Wiring** (Dependency Injection) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/dependency_injection_wiring/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Container | `Container` | declared in `snippet.py` |
| ManagedBean | `Service` | declared in `snippet.py` |
| ManagedBean | `RealDao` | declared in `snippet.py` |
| ManagedBean | `FakeDao` | declared in `snippet.py` |
| Bean contract | `Bean` | declared in `snippet.py` |
