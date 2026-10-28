# Memento Pattern — JavaScript (Node.js) Implementation

## Pattern Problem
Implements the **Hearth History Manager & Edit Transaction** memento collaboration from `ha-fusion` (`src/lib/Hearth/store.ts` and `src/lib/Hearth/historyManager.ts`), which provides bounded undo/redo stacks and transactional rollback snapshots for smart home room dashboard configurations.

## File Manifest
- `hearthHistoryMemento.js`: Production snippet defining `DashboardConfig` immutable state memento and generic `HistoryManager` caretaker with bounded stack management and transactional rollback.
- `testRunner.js`: Separate test harness evaluating push, undo, redo, transactional edit mode cancellation rollback, capacity bounds, and clear behavior.

## How to Run
From the root of `A4/`:
```bash
node Part3/memento_history/javascript/testRunner.js
```

## Timing Protocol
Measured using Node.js `perf_hooks.performance.now()` in milliseconds across 1 warm-up run and 5 measured runs.
