# Part 3 — Python Implementations

## Requirements
- Python 3.11 or later
- No external dependencies (uses `abc`, `typing` only)

## How to Run

### Strategy Pattern
```bash
python3 Part3/code/python/strategy.py
```
Expected output:
```
BubbleSort: [1, 2, 3, 4, 5]
QuickSort: [1, 2, 3, 4, 5]
```

### Observer Pattern
```bash
python3 Part3/code/python/observer.py
```
Expected output:
```
Logger: STARTED
Logger: PROCESSING
Logger: DONE
```

## Test
Manual inspection — runs without errors and output matches expected above.
LOC: strategy.py = 31, observer.py = 32
Max CC: 2 (per function)
Median run time: ~8 ms (Strategy), ~7 ms (Observer)
Note: Python uses ABC abstractmethod for Strategy; Protocol structural subtyping for Observer.
