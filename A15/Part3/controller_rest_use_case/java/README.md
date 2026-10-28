# Controller - REST Use-Case Controller (Java)

Snippet of the confirmed instance **REST Use-Case Controller** (Controller) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (5 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/controller_rest_use_case/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=5 total=5` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Controller | `AccountController` | declared in `Snippet.java` |
| Delegate (service contract) | `BankApi` | declared in `Snippet.java` |
