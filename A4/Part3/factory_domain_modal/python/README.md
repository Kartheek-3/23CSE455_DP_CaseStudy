# Factory Method Pattern — Python Implementation

## Pattern Problem
Implements the **Entity Domain Modal Factory** parameterized creation mechanism from `ha-fusion` (`src/lib/Hearth/modals.ts` and `src/lib/Modals.ts`), where dashboard click events dynamically parse smart home entity identifiers and instantiate domain-specific control dialogs (`light`, `switch`, `sensor`, `climate`, and fallback generic inspector).

## File Manifest
- `entity_modal_factory.py`: Production snippet defining `EntityModalController` base product, concrete controllers (`LightModalController`, `SwitchModalController`, `SensorModalController`, `ClimateModalController`, `GenericModalController`), and `ModalFactory` creator.
- `test_runner.py`: Test runner evaluating domain extraction and polymorphic modal creation across all supported domains.

## How to Run
From the root of `A4/`:
```bash
python Part3/factory_domain_modal/python/test_runner.py
```

## Timing Protocol
Measured using `time.perf_counter()` in milliseconds across 1 warm-up run and 5 measured runs.
