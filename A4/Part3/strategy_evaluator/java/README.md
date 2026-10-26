# Strategy Pattern — Java Implementation

## Pattern Problem
Implements the **Visibility Condition Evaluator Dispatch** strategy from `ha-fusion` (`src/lib/Conditional.ts` refactored in CH01), where condition evaluation logic is factored out of switch blocks into interchangeable strategy objects registered within an evaluation context.

## File Manifest
- `ConditionStrategy.java`: Production snippet defining `ConditionStrategy` interface, concrete strategy classes (`StateStrategy`, `NumericStrategy`, `ScreenStrategy`), and `EvaluatorContext` strategy selector/registry.
- `TestRunner.java`: Test runner executing evaluations across built-in and dynamically registered strategies.

## How to Compile & Run
From the root of `A4/`:
```bash
javac -d Part3/strategy_evaluator/java/bin Part3/strategy_evaluator/java/ConditionStrategy.java Part3/strategy_evaluator/java/TestRunner.java
java -cp Part3/strategy_evaluator/java/bin strategy.TestRunner
```

## Timing Protocol
Measured using `System.nanoTime()` in milliseconds across 1 warm-up run and 5 measured runs.
