# Transaction Script - Account Deposit and Withdrawal Script (JavaScript)

Snippet of the confirmed instance **Account Deposit and Withdrawal Script** (Transaction Script) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/transaction_script_account/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TransactionScript host (deposit, withdraw) | `AccountScripts` | declared in `snippet.js` |
| RowData | `Row` | not declared - duck typing / plain object: role is not separately declared |
