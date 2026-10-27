# Dependency Injection - CDI Field Injection Wiring (C++)

Snippet of the confirmed instance **CDI Field Injection Wiring** (Dependency Injection) implemented in C++. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.hpp` (measured for LOC / complexity)
- Test driver: `run_tests.cpp` (not measured); shared fixtures: `../test-cases/cases.txt` (7 cases)
- Runtime: g++ 13.3.0 (-std=c++17 -O1)

## Run (working folder: `Part3/dependency_injection_wiring/cpp`)
```
g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt
```
Expected last line: `RESULT passed=7 total=7` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| Container | `Container` | declared in `snippet.hpp` |
| ManagedBean | `Service` | declared in `snippet.hpp` |
| ManagedBean | `RealDao` | declared in `snippet.hpp` |
| ManagedBean | `FakeDao` | declared in `snippet.hpp` |
| Bean contract | `Bean` | declared in `snippet.hpp` |
