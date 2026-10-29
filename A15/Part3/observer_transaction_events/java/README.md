# Observer - Transaction Audit and Alert Notification (Java)

Snippet of the confirmed instance **Transaction Audit and Alert Notification** (Observer) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/observer_transaction_events/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Subject | `AccountService` | declared in `Snippet.java` |
| SubjectChannel | `EventPublisher` | declared in `Snippet.java` |
| Event | `Event` | declared in `Snippet.java` |
| Observer (contract) | `Observer` | declared in `Snippet.java` |
| ConcreteObserver | `AuditLog` | declared in `Snippet.java` |
| ConcreteObserver | `HighValueAlert` | declared in `Snippet.java` |
