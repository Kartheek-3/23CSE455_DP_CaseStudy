# Data Transfer Object - API Payload DTO Assembly (JavaScript)

Snippet of the confirmed instance **API Payload DTO Assembly** (Data Transfer Object) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (5 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/dto_user_assembly/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=5 total=5` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DataTransferObject | `UserDto` | declared in `snippet.js` |
| DomainObject | `User` | declared in `snippet.js` |
| Assembler | `UserAssembler` | declared in `snippet.js` |
