# Domain Model - Account Balance Domain Model (C++)

Snippet of the confirmed instance **Account Balance Domain Model** (Domain Model) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (12 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/domain_model_account/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=12 total=12` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DomainObject | `Account` | declared in `snippet.hpp` |
| Orchestrator | `Bank` | declared in `snippet.hpp` |
