# Domain Model - Account Balance Domain Model (JavaScript)

Snippet of the confirmed instance **Account Balance Domain Model** (Domain Model) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (12 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/domain_model_account/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=12 total=12` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DomainObject | `Account` | declared in `snippet.js` |
| Orchestrator | `Bank` | declared in `snippet.js` |
