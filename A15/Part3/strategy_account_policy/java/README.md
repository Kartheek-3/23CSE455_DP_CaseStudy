# Strategy - Account Type Policy (Java)

Snippet of the confirmed instance **Account Type Policy** (Strategy) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/strategy_account_policy/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Strategy | `AccountPolicy` | declared in `Snippet.java` |
| ConcreteStrategy | `SavingsPolicy` | declared in `Snippet.java` |
| ConcreteStrategy | `CheckingPolicy` | declared in `Snippet.java` |
| StrategySelector | `PolicyResolver` | declared in `Snippet.java` |
| Context | `Account` | declared in `Snippet.java` |
