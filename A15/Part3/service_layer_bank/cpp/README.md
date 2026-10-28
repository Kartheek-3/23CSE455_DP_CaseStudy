# Service Layer - Banking Use-Case Service Layer (C++)

Snippet of the confirmed instance **Banking Use-Case Service Layer** (Service Layer) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (6 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/service_layer_bank/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=6 total=6` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| ServiceLayer | `BankService` | declared in `snippet.hpp` |
| Collaborator | `UserRepo` | declared in `snippet.hpp` |
| Collaborator | `AccountRepo` | declared in `snippet.hpp` |
