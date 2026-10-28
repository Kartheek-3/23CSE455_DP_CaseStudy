# Service Layer - Banking Use-Case Service Layer (JavaScript)

Snippet of the confirmed instance **Banking Use-Case Service Layer** (Service Layer) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/service_layer_bank/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| ServiceLayer | `BankService` | declared in `snippet.js` |
| Collaborator | `UserRepo` | declared in `snippet.js` |
| Collaborator | `AccountRepo` | declared in `snippet.js` |
