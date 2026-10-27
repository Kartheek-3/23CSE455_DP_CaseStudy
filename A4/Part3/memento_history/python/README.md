# Memento Pattern — Python Implementation

## Pattern Problem
Implements the **Hearth History Manager & Edit Transaction** memento collaboration from `ha-fusion` (`src/lib/Hearth/store.ts` and `src/lib/Hearth/historyManager.ts`), which provides bounded undo/redo stacks and transactional rollback snapshots for smart home room dashboard configurations.

## File Manifest
- `hearth_history_memento.py`: Production snippet defining `DashboardConfig` immutable state memento and generic `HistoryManager[T]` caretaker with bounded stack management and transactional rollback.
- `test_runner.py`: Separate test harness evaluating push, undo, redo, transactional edit mode cancellation rollback, capacity bounds, and clear behavior.

## How to Run
From the root of `A4/`:
```bash
python Part3/memento_history/python/test_runner.py
```

## Timing Protocol
Measured using `time.perf_counter()` in milliseconds across 1 warm-up run and 5 measured runs.
