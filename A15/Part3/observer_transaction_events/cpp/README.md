# Observer - Transaction Audit and Alert Notification (C++)

Snippet of the confirmed instance **Transaction Audit and Alert Notification** (Observer) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/observer_transaction_events/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Subject | `AccountService` | declared in `snippet.hpp` |
| SubjectChannel | `EventPublisher` | declared in `snippet.hpp` |
| Event | `Event` | declared in `snippet.hpp` |
| Observer (contract) | `Observer` | declared in `snippet.hpp` |
| ConcreteObserver | `AuditLog` | declared in `snippet.hpp` |
| ConcreteObserver | `HighValueAlert` | declared in `snippet.hpp` |
