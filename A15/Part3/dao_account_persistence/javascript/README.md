# Data Access Object - Account and User Persistence DAO (JavaScript)

Snippet of the confirmed instance **Account and User Persistence DAO** (Data Access Object) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/dao_account_persistence/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DataAccessObject | `AccountDao` | declared in `snippet.js` |
| ConcreteDAO | `InMemoryAccountDao` | declared in `snippet.js` |
| TransferObject | `Account` | declared in `snippet.js` |
| BusinessObject | `AccountService` | declared in `snippet.js` |
