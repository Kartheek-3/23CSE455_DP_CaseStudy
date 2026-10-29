# Service Layer - Banking Use-Case Service Layer (Python)

Snippet of the confirmed instance **Banking Use-Case Service Layer** (Service Layer) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/service_layer_bank/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| ServiceLayer | `BankService` | declared in `snippet.py` |
| Collaborator | `UserRepo` | declared in `snippet.py` |
| Collaborator | `AccountRepo` | declared in `snippet.py` |
