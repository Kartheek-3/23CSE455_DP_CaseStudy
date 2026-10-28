# Composite Pattern — C++ Implementation

## Pattern Problem
Implements the recursive **Visibility Condition Tree** from `ha-fusion` (`src/lib/Types.ts` and `src/lib/Conditional.ts`), where smart home dashboard cards and sections evaluate conditional visibility expressions (Leaf state and numeric comparisons, and Composite `and`, `or`, and `not` operators) over an active entity state map.

## File Manifest
- `condition_composite.hpp` & `condition_composite.cpp`: Production snippet defining polymorphic abstract base `ConditionComposite`, leaf classes (`StateCondition`, `NumericStateCondition`), and composite classes (`AndCondition`, `OrCondition`, `NotCondition`).
- `test_runner.cpp`: Test harness executing 6 comprehensive test scenarios across atomic leaves and nested composite trees.

## How to Compile & Run
From the root of `A4/`:
```bash
g++ -O2 -std=c++14 -I Part3/composite_condition/cpp Part3/composite_condition/cpp/condition_composite.cpp Part3/composite_condition/cpp/test_runner.cpp -o Part3/composite_condition/cpp/test_runner.exe
Part3/composite_condition/cpp/test_runner.exe
```

## Timing Protocol
Measured using `std::chrono::high_resolution_clock` inside `test_runner.cpp` in milliseconds. The reported median is computed from 1 warm-up run and 5 measured runs.
