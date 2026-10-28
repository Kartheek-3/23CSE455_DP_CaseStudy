# Part 3 — JavaScript Implementations

## Requirements
- Node.js 20 or later
- No external dependencies

## How to Run

### Strategy Pattern
```bash
node Part3/code/js/strategy.js
```
Expected output:
```
BubbleSort: 1,2,3,4,5
QuickSort: 1,2,3,4,5
```

### Observer Pattern
```bash
node Part3/code/js/observer.js
```
Expected output:
```
Logger: STARTED
Logger: PROCESSING
Logger: DONE
```

## Test
Manual inspection — runs without errors and output matches expected above.
LOC: strategy.js = 27, observer.js = 26
Max CC: 2 (per function)
Median run time: ~6 ms (Strategy), ~5 ms (Observer)
Note: JavaScript uses duck-typing — no explicit interface contract; forEach idiomatic for observer iteration.
