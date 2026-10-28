# Data Access Object - Account and User Persistence DAO (C++)

Snippet of the confirmed instance **Account and User Persistence DAO** (Data Access Object) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/dao_account_persistence/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DataAccessObject | `AccountDao` | declared in `snippet.hpp` |
| ConcreteDAO | `InMemoryAccountDao` | declared in `snippet.hpp` |
| TransferObject | `Account` | declared in `snippet.hpp` |
| BusinessObject | `AccountService` | declared in `snippet.hpp` |
