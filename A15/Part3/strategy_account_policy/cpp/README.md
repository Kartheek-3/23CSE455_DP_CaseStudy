# Strategy - Account Type Policy (C++)

Snippet of the confirmed instance **Account Type Policy** (Strategy) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (8 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/strategy_account_policy/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=8 total=8` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Strategy | `AccountPolicy` | declared in `snippet.hpp` |
| ConcreteStrategy | `SavingsPolicy` | declared in `snippet.hpp` |
| ConcreteStrategy | `CheckingPolicy` | declared in `snippet.hpp` |
| StrategySelector | `PolicyResolver` | declared in `snippet.hpp` |
| Context | `Account` | declared in `snippet.hpp` |
