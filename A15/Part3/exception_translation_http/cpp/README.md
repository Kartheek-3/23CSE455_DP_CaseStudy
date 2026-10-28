# Exception Translation - HTTP Error Translation (C++)

Snippet of the confirmed instance **HTTP Error Translation** (Exception Translation) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/exception_translation_http/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| TranslatedException | `HttpError` | declared in `snippet.hpp` |
| TranslatedException | `BadRequest` | declared in `snippet.hpp` |
| TranslatedException | `NotFound` | declared in `snippet.hpp` |
| Raiser | `AccountService` | declared in `snippet.hpp` |
| Translator | `translate` | declared in `snippet.hpp` |
