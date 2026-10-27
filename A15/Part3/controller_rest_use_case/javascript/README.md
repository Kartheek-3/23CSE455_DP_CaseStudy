# Controller - REST Use-Case Controller (JavaScript)

Snippet of the confirmed instance **REST Use-Case Controller** (Controller) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (5 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/controller_rest_use_case/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=5 total=5` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Controller | `AccountController` | declared in `snippet.js` |
| Delegate (service contract) | `BankApi` | not declared - duck typing / plain object: role is not separately declared |
