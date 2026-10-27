# Composite Pattern — JavaScript (Node.js) Implementation

## Pattern Problem
Implements the recursive **Visibility Condition Tree** from `ha-fusion` (`src/lib/Types.ts` and `src/lib/Conditional.ts`), where smart home dashboard cards and sections evaluate conditional visibility expressions (Leaf state and numeric comparisons, and Composite `and`, `or`, and `not` operators) over an active entity state map.

## File Manifest
- `conditionComposite.js`: Production snippet implementing the `ConditionComposite` base class, leaf classes (`StateCondition`, `NumericStateCondition`), and composite classes (`AndCondition`, `OrCondition`, `NotCondition`).
- `testRunner.js`: Test runner evaluating 6 scenarios including leaf comparisons, logical combinations, and deeply nested trees.

## How to Run
From the root of `A4/`:
```bash
node Part3/composite_condition/javascript/testRunner.js
```

## Timing Protocol
Measured using Node.js `perf_hooks.performance.now()` in milliseconds. The reported median is computed from 1 warm-up run and 5 measured runs.
