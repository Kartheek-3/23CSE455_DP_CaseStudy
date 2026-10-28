# Domain Model - Account Balance Domain Model (Python)

Snippet of the confirmed instance **Account Balance Domain Model** (Domain Model) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (12 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/domain_model_account/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=12 total=12` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DomainObject | `Account` | declared in `snippet.py` |
| Orchestrator | `Bank` | declared in `snippet.py` |
