# Strategy - Account Type Policy (Python)

Snippet of the confirmed instance **Account Type Policy** (Strategy) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/strategy_account_policy/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Strategy | `AccountPolicy` | declared in `snippet.py` |
| ConcreteStrategy | `SavingsPolicy` | declared in `snippet.py` |
| ConcreteStrategy | `CheckingPolicy` | declared in `snippet.py` |
| StrategySelector | `PolicyResolver` | declared in `snippet.py` |
| Context | `Account` | declared in `snippet.py` |
