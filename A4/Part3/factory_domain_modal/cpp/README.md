# Factory Method Pattern — C++ Implementation

## Pattern Problem
Implements the **Entity Domain Modal Factory** parameterized creation mechanism from `ha-fusion` (`src/lib/Hearth/modals.ts` and `src/lib/Modals.ts`), where dashboard click events dynamically parse smart home entity identifiers and instantiate domain-specific control dialogs (`light`, `switch`, `sensor`, `climate`, and fallback generic inspector).

## File Manifest
- `entity_modal_factory.hpp` & `entity_modal_factory.cpp`: Production snippet defining `EntityModalController` abstract product, concrete controllers (`LightModalController`, `SwitchModalController`, `SensorModalController`, `ClimateModalController`, `GenericModalController`), and `ModalFactory` creator.
- `test_runner.cpp`: Test runner evaluating domain extraction and polymorphic modal creation across all supported domains.

## How to Compile & Run
From the root of `A4/`:
```bash
g++ -O2 -std=c++14 -I Part3/factory_domain_modal/cpp Part3/factory_domain_modal/cpp/entity_modal_factory.cpp Part3/factory_domain_modal/cpp/test_runner.cpp -o Part3/factory_domain_modal/cpp/test_runner.exe
Part3/factory_domain_modal/cpp/test_runner.exe
```

## Timing Protocol
Measured using `std::chrono::high_resolution_clock` inside `test_runner.cpp` in milliseconds across 1 warm-up run and 5 measured runs.
