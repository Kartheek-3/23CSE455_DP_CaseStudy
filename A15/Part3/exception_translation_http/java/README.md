# Exception Translation - HTTP Error Translation (Java)

Snippet of the confirmed instance **HTTP Error Translation** (Exception Translation) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/exception_translation_http/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TranslatedException | `HttpError` | declared in `Snippet.java` |
| TranslatedException | `BadRequest` | declared in `Snippet.java` |
| TranslatedException | `NotFound` | declared in `Snippet.java` |
| Raiser | `AccountService` | declared in `Snippet.java` |
| Translator | `translate` | declared in `Snippet.java` |
