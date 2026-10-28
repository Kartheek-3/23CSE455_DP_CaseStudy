# Domain Model - Account Balance Domain Model (Java)

Snippet of the confirmed instance **Account Balance Domain Model** (Domain Model) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (12 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/domain_model_account/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=12 total=12` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DomainObject | `Account` | declared in `Snippet.java` |
| Orchestrator | `Bank` | declared in `Snippet.java` |
