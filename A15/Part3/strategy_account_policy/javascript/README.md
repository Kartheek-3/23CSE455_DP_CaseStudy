# Strategy - Account Type Policy (JavaScript)

Snippet of the confirmed instance **Account Type Policy** (Strategy) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/strategy_account_policy/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Strategy | `AccountPolicy` | declared in `snippet.js` |
| ConcreteStrategy | `SavingsPolicy` | declared in `snippet.js` |
| ConcreteStrategy | `CheckingPolicy` | declared in `snippet.js` |
| StrategySelector | `PolicyResolver` | declared in `snippet.js` |
| Context | `Account` | declared in `snippet.js` |
