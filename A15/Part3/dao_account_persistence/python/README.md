# Data Access Object - Account and User Persistence DAO (Python)

Snippet of the confirmed instance **Account and User Persistence DAO** (Data Access Object) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/dao_account_persistence/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DataAccessObject | `AccountDao` | declared in `snippet.py` |
| ConcreteDAO | `InMemoryAccountDao` | declared in `snippet.py` |
| TransferObject | `Account` | declared in `snippet.py` |
| BusinessObject | `AccountService` | declared in `snippet.py` |
