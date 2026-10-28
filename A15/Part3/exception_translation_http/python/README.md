# Exception Translation - HTTP Error Translation (Python)

Snippet of the confirmed instance **HTTP Error Translation** (Exception Translation) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/exception_translation_http/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TranslatedException | `HttpError` | declared in `snippet.py` |
| TranslatedException | `BadRequest` | declared in `snippet.py` |
| TranslatedException | `NotFound` | declared in `snippet.py` |
| Raiser | `AccountService` | declared in `snippet.py` |
| Translator | `translate` | declared in `snippet.py` |
