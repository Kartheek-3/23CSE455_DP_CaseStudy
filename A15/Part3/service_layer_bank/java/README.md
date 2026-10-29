# Service Layer - Banking Use-Case Service Layer (Java)

Snippet of the confirmed instance **Banking Use-Case Service Layer** (Service Layer) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/service_layer_bank/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| ServiceLayer | `BankService` | declared in `Snippet.java` |
| Collaborator | `UserRepo` | declared in `Snippet.java` |
| Collaborator | `AccountRepo` | declared in `Snippet.java` |
