# Controller - REST Use-Case Controller (Python)

Snippet of the confirmed instance **REST Use-Case Controller** (Controller) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (5 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/controller_rest_use_case/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=5 total=5` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Controller | `AccountController` | declared in `snippet.py` |
| Delegate (service contract) | `BankApi` | not declared - duck typing: role is not separately declared |
