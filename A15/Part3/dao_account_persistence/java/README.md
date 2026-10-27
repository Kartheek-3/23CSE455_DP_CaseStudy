# Data Access Object - Account and User Persistence DAO (Java)

Snippet of the confirmed instance **Account and User Persistence DAO** (Data Access Object) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/dao_account_persistence/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DataAccessObject | `AccountDao` | declared in `Snippet.java` |
| ConcreteDAO | `InMemoryAccountDao` | declared in `Snippet.java` |
| TransferObject | `Account` | declared in `Snippet.java` |
| BusinessObject | `AccountService` | declared in `Snippet.java` |
