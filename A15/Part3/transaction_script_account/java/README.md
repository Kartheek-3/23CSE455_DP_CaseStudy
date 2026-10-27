# Transaction Script - Account Deposit and Withdrawal Script (Java)

Snippet of the confirmed instance **Account Deposit and Withdrawal Script** (Transaction Script) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/transaction_script_account/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TransactionScript host (deposit, withdraw) | `AccountScripts` | declared in `Snippet.java` |
| RowData | `Row` | declared in `Snippet.java` |
