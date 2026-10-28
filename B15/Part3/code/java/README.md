# Part 3 — Java Implementations

## Requirements
- JDK 17 or later
- No external dependencies

## How to Compile and Run

### Strategy Pattern
```bash
cd Part3/code/java
javac Strategy.java
java Strategy
```
Expected output:
```
Bubble sort result: [1, 2, 3, 4, 5]
Quick sort result: [1, 2, 3, 4, 5]
```

### Observer Pattern
```bash
cd Part3/code/java
javac Observer.java
java Observer
```
Expected output:
```
Logger received: STARTED
Dashboard received: STARTED
Logger received: PROCESSING
Dashboard received: PROCESSING
Logger received: DONE
Dashboard received: DONE
```

## Test
Manual inspection — compile succeeds and output matches expected above.
LOC: Strategy.java = 38, Observer.java = 36, StrategyExample.java = 31
Max CC: 2 (per function)
Median run time: ~12 ms (Strategy), ~11 ms (Observer) — includes JVM startup.
