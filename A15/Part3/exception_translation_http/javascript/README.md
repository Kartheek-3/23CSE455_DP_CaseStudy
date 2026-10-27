# Exception Translation - HTTP Error Translation (JavaScript)

Snippet of the confirmed instance **HTTP Error Translation** (Exception Translation) implemented in JavaScript. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.js` (measured for LOC / complexity)
- Test driver: `run_tests.js` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: Node.js v22.22.0

## Run (working folder: `Part3/exception_translation_http/javascript`)
```
node run_tests.js ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TranslatedException | `HttpError` | declared in `snippet.js` |
| TranslatedException | `BadRequest` | declared in `snippet.js` |
| TranslatedException | `NotFound` | declared in `snippet.js` |
| Raiser | `AccountService` | declared in `snippet.js` |
| Translator | `translate` | declared in `snippet.js` |
