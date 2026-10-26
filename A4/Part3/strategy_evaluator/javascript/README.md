# Strategy Pattern — JavaScript (Node.js) Implementation

## Pattern Problem
Implements the **Visibility Condition Evaluator Dispatch** strategy from `ha-fusion` (`src/lib/Conditional.ts` refactored in CH01), where condition evaluation logic is factored out of switch blocks into interchangeable strategy objects registered within an evaluation context.

## File Manifest
- `conditionStrategy.js`: Production snippet defining `ConditionStrategy` base class, concrete strategy classes (`StateStrategy`, `NumericStrategy`, `ScreenStrategy`), and `EvaluatorContext` strategy selector/registry supporting both class-based and functional strategy closures.
- `testRunner.js`: Test runner executing evaluations across built-in and dynamically registered strategies.

## How to Run
From the root of `A4/`:
```bash
node Part3/strategy_evaluator/javascript/testRunner.js
```

## Timing Protocol
Measured using Node.js `perf_hooks.performance.now()` in milliseconds across 1 warm-up run and 5 measured runs.
