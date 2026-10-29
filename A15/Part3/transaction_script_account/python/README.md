# Transaction Script - Account Deposit and Withdrawal Script (Python)

Snippet of the confirmed instance **Account Deposit and Withdrawal Script** (Transaction Script) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/transaction_script_account/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TransactionScript host (deposit, withdraw) | `AccountScripts` | declared in `snippet.py` |
| RowData | `Row` | declared in `snippet.py` |
