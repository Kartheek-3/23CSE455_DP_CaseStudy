# Controller - REST Use-Case Controller (C++)

Snippet of the confirmed instance **REST Use-Case Controller** (Controller) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (5 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/controller_rest_use_case/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=5 total=5` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Controller | `AccountController` | declared in `snippet.hpp` |
| Delegate (service contract) | `BankApi` | declared in `snippet.hpp` |
