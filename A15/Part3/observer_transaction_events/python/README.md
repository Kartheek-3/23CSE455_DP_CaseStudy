# Observer - Transaction Audit and Alert Notification (Python)

Snippet of the confirmed instance **Transaction Audit and Alert Notification** (Observer) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/observer_transaction_events/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Subject | `AccountService` | declared in `snippet.py` |
| SubjectChannel | `EventPublisher` | declared in `snippet.py` |
| Event | `Event` | declared in `snippet.py` |
| Observer (contract) | `Observer` | not declared - duck typing: role is not separately declared |
| ConcreteObserver | `AuditLog` | declared in `snippet.py` |
| ConcreteObserver | `HighValueAlert` | declared in `snippet.py` |
