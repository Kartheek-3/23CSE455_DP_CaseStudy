# Memento Pattern — C++ Implementation

## Pattern Problem
Implements the **Hearth History Manager & Edit Transaction** memento collaboration from `ha-fusion` (`src/lib/Hearth/store.ts` and `src/lib/Hearth/historyManager.ts`), which provides bounded undo/redo stacks and transactional rollback snapshots for smart home room dashboard configurations.

## File Manifest
- `hearth_history_memento.hpp` & `hearth_history_memento.cpp`: Production snippet defining `DashboardConfig` immutable state memento and generic `HistoryManager<T>` caretaker with bounded stack management and transactional rollback.
- `test_runner.cpp`: Separate test harness evaluating push, undo, redo, transactional edit mode cancellation rollback, capacity bounds, and clear behavior.

## How to Compile & Run
From the root of `A4/`:
```bash
g++ -O2 -std=c++14 -I Part3/memento_history/cpp Part3/memento_history/cpp/hearth_history_memento.cpp Part3/memento_history/cpp/test_runner.cpp -o Part3/memento_history/cpp/test_runner.exe
Part3/memento_history/cpp/test_runner.exe
```

## Timing Protocol
Measured using `std::chrono::high_resolution_clock` inside `test_runner.cpp` in milliseconds across 1 warm-up run and 5 measured runs.
