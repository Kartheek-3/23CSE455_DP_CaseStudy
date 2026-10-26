# Factory Method Pattern — JavaScript (Node.js) Implementation

## Pattern Problem
Implements the **Entity Domain Modal Factory** parameterized creation mechanism from `ha-fusion` (`src/lib/Hearth/modals.ts` and `src/lib/Modals.ts`), where dashboard click events dynamically parse smart home entity identifiers and instantiate domain-specific control dialogs (`light`, `switch`, `sensor`, `climate`, and fallback generic inspector).

## File Manifest
- `entityModalFactory.js`: Production snippet defining `EntityModalController` base product, concrete controllers (`LightModalController`, `SwitchModalController`, `SensorModalController`, `ClimateModalController`, `GenericModalController`), and `ModalFactory` creator.
- `testRunner.js`: Test runner evaluating domain extraction and polymorphic modal creation across all supported domains.

## How to Run
From the root of `A4/`:
```bash
node Part3/factory_domain_modal/javascript/testRunner.js
```

## Timing Protocol
Measured using Node.js `perf_hooks.performance.now()` in milliseconds across 1 warm-up run and 5 measured runs.
