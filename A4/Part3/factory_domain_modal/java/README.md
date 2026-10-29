# Factory Method Pattern — Java Implementation

## Pattern Problem
Implements the **Entity Domain Modal Factory** parameterized creation mechanism from `ha-fusion` (`src/lib/Hearth/modals.ts` and `src/lib/Modals.ts`), where dashboard click events dynamically parse smart home entity identifiers and instantiate domain-specific control dialogs (`light`, `switch`, `sensor`, `climate`, and fallback generic inspector).

## File Manifest
- `EntityModalFactory.java`: Production snippet defining `EntityModalController` product interface, concrete controllers (`LightModalController`, `SwitchModalController`, `SensorModalController`, `ClimateModalController`, `GenericModalController`), and `ModalFactory` creator.
- `TestRunner.java`: Test runner evaluating domain extraction and polymorphic modal creation across all supported domains.

## How to Compile & Run
From the root of `A4/`:
```bash
javac -d Part3/factory_domain_modal/java/bin Part3/factory_domain_modal/java/EntityModalFactory.java Part3/factory_domain_modal/java/TestRunner.java
java -cp Part3/factory_domain_modal/java/bin factory.TestRunner
```

## Timing Protocol
Measured using `System.nanoTime()` in milliseconds across 1 warm-up run and 5 measured runs.
