# Strategy Pattern — C++ Implementation

## Pattern Problem
Implements the **Visibility Condition Evaluator Dispatch** strategy from `ha-fusion` (`src/lib/Conditional.ts` refactored in CH01), where condition evaluation logic is factored out of switch blocks into interchangeable strategy objects registered within an evaluation context.

## File Manifest
- `condition_strategy.hpp` & `condition_strategy.cpp`: Production snippet defining `ConditionStrategy` polymorphic interface, concrete strategy classes (`StateStrategy`, `NumericStrategy`, `ScreenStrategy`), and `EvaluatorContext` strategy selector/registry.
- `test_runner.cpp`: Test runner executing evaluations across built-in and dynamically registered strategies.

## How to Compile & Run
From the root of `A4/`:
```bash
g++ -O2 -std=c++14 -I Part3/strategy_evaluator/cpp Part3/strategy_evaluator/cpp/condition_strategy.cpp Part3/strategy_evaluator/cpp/test_runner.cpp -o Part3/strategy_evaluator/cpp/test_runner.exe
Part3/strategy_evaluator/cpp/test_runner.exe
```

## Timing Protocol
Measured using `std::chrono::high_resolution_clock` inside `test_runner.cpp` in milliseconds across 1 warm-up run and 5 measured runs.
