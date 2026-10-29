# Observer - Transaction Audit and Alert Notification (JavaScript)

Snippet of the confirmed instance **Transaction Audit and Alert Notification** (Observer) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/observer_transaction_events/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Subject | `AccountService` | declared in `snippet.js` |
| SubjectChannel | `EventPublisher` | declared in `snippet.js` |
| Event | `Event` | declared in `snippet.js` |
| Observer (contract) | `Observer` | not declared - duck typing / plain object: role is not separately declared |
| ConcreteObserver | `AuditLog` | declared in `snippet.js` |
| ConcreteObserver | `HighValueAlert` | declared in `snippet.js` |
