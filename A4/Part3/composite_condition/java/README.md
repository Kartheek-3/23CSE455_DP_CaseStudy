# Composite Pattern — Java Implementation

## Pattern Problem
Implements the recursive **Visibility Condition Tree** from `ha-fusion` (`src/lib/Types.ts` and `src/lib/Conditional.ts`), where smart home dashboard cards and sections evaluate conditional visibility expressions (Leaf state and numeric comparisons, and Composite `and`, `or`, and `not` operators) over an active entity state map.

## File Manifest
- `ConditionComposite.java`: Production snippet containing the `ConditionComposite` interface, leaf classes (`StateCondition`, `NumericStateCondition`), and composite classes (`AndCondition`, `OrCondition`, `NotCondition`).
- `TestRunner.java`: Separate test harness executing 6 comprehensive test scenarios across atomic leaves and nested composite trees.

## How to Compile & Run
From the root of `A4/`:
```bash
javac -d Part3/composite_condition/java/bin Part3/composite_condition/java/ConditionComposite.java Part3/composite_condition/java/TestRunner.java
java -cp Part3/composite_condition/java/bin composite.TestRunner
```

## Timing Protocol
Execution time measures the pure evaluation and assertions of the test runner using `System.nanoTime()` in milliseconds. The reported median is derived from 1 warm-up run followed by 5 consecutive measured runs on the same machine.
