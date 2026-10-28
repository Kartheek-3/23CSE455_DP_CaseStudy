# Transaction Script - Account Deposit and Withdrawal Script (C++)

Snippet of the confirmed instance **Account Deposit and Withdrawal Script** (Transaction Script) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/transaction_script_account/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TransactionScript host (deposit, withdraw) | `AccountScripts` | declared in `snippet.hpp` |
| RowData | `Row` | declared in `snippet.hpp` |
