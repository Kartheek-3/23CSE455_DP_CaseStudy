# Dependency Injection - CDI Field Injection Wiring (Java)

Snippet of the confirmed instance **CDI Field Injection Wiring** (Dependency Injection) implemented in Java. Behaviour and test cases are identical in all four languages.

- Production code: `Snippet.java` (measured for LOC / complexity)
- Test driver: `Runner.java` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: OpenJDK 21.0.12.1 (javac --release default)

## Run (working folder: `Part3/dependency_injection_wiring/java`)
```
javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Container | `Container` | declared in `Snippet.java` |
| ManagedBean | `Service` | declared in `Snippet.java` |
| ManagedBean | `RealDao` | declared in `Snippet.java` |
| ManagedBean | `FakeDao` | declared in `Snippet.java` |
| Bean contract | `Bean` | declared in `Snippet.java` |
