# Memento Pattern — Java Implementation

## Pattern Problem
Implements the **Hearth History Manager & Edit Transaction** memento collaboration from `ha-fusion` (`src/lib/Hearth/store.ts` and `src/lib/Hearth/historyManager.ts`), which provides bounded undo/redo stacks and transactional rollback snapshots for smart home room dashboard configurations.

## File Manifest
- `HearthHistoryMemento.java`: Production snippet defining `DashboardConfig` immutable state memento and generic `HistoryManager<T>` caretaker with bounded stack management and transactional rollback.
- `TestRunner.java`: Separate test harness evaluating push, undo, redo, transactional edit mode cancellation rollback, capacity bounds, and clear behavior.

## How to Compile & Run
From the root of `A4/`:
```bash
javac -d Part3/memento_history/java/bin Part3/memento_history/java/HearthHistoryMemento.java Part3/memento_history/java/TestRunner.java
java -cp Part3/memento_history/java/bin memento.TestRunner
```

## Timing Protocol
Measured using `System.nanoTime()` in milliseconds across 1 warm-up run and 5 measured runs.
