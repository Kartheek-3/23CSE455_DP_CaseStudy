# Part 3 — C++ Implementations

## Requirements
- g++ with C++17 support (`g++ -std=c++17`)
- Linux / macOS / WSL

## How to Compile and Run

### Strategy Pattern
```bash
cd Part3/code/cpp
g++ -std=c++17 strategy.cpp -o strategy
./strategy
```
Expected output:
```
BubbleSort: 1 2 3 4 5
QuickSort: 1 2 3 4 5
```

### Observer Pattern
```bash
cd Part3/code/cpp
g++ -std=c++17 observer.cpp -o observer
./observer
```
Expected output:
```
Logger: STARTED
Logger: PROCESSING
Logger: DONE
```

## Test
Manual inspection — compiles without warnings and output matches expected above.
LOC: strategy.cpp = 44, observer.cpp = 42
Max CC: 2 (per function)
Median run time: ~3 ms (Strategy), ~3 ms (Observer) — native code, no VM startup.
Note: Uses pure virtual base class; shared_ptr for ownership; virtual destructor required for observer; RAII manages lifecycle.
