# Composite Pattern — Python Implementation

## Pattern Problem
Implements the recursive **Visibility Condition Tree** from `ha-fusion` (`src/lib/Types.ts` and `src/lib/Conditional.ts`), where smart home dashboard cards and sections evaluate conditional visibility expressions (Leaf state and numeric comparisons, and Composite `and`, `or`, and `not` operators) over an active entity state map.

## File Manifest
- `condition_composite.py`: Production snippet defining abstract base `ConditionComposite`, leaf classes (`StateCondition`, `NumericStateCondition`), and composite classes (`AndCondition`, `OrCondition`, `NotCondition`).
- `test_runner.py`: Test harness testing 6 atomic and composite condition expressions.

## How to Run
From the root of `A4/`:
```bash
python Part3/composite_condition/python/test_runner.py
```

## Timing Protocol
Measured with `time.perf_counter()` inside the test harness in milliseconds. The reported median is derived from 1 warm-up run followed by 5 consecutive measured runs.
