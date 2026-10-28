# Change 2 (CH02) – Add different irrigation strategies

## Requirement (case-study wording)

**CH02: Add different irrigation strategies.** (Builds on CH01: crop profiles supply the moisture band.)

Interpretation for Mycodo: the bang-bang irrigation Function decides *when* to irrigate. Today it has
exactly one policy, the hysteresis band, mirrored for the two directions `raise` and `lower`. The
farmer can now choose an **irrigation strategy**:

| Strategy id | Behaviour |
|---|---|
| `hysteresis` (default) | The current band behaviour: on below `setpoint − hysteresis`, off above `setpoint + hysteresis` (mirrored for `lower`). |
| `time_window` | The band behaviour, but only inside allowed time windows (e.g. `05:00-09:00,18:00-21:00`, to avoid evaporation at noon). Outside the windows the pump is not switched on, and a running pump is switched off. Windows may cross midnight (`22:00-02:00`); the start is inclusive and the end exclusive. |
| `skip_if_rain` | The band behaviour, but irrigation is skipped while a selected *rain indicator* measurement is at or above a threshold. A running pump is switched off. If the rain reading is missing, the band behaviour is used (fail-safe: the crop still gets water) and a warning is logged. |

Code area (code before CH02 = `Part2/changes/Change1/code/`): `mycodo/functions/bang_bang.py`,
`CustomModule.loop()` (lines 194-243) and `initialize()` (161-178). The suggested starting point fits.

Note on the rain indicator: the bundled weather Inputs in this commit (`weather_openweathermap_weather.py`,
`weather_openweathermap_onecall.py`) do not provide a precipitation measurement. The strategy therefore
accepts **any** selected measurement plus a threshold, for example a precipitation-probability
measurement from a custom Input, or relative humidity as a proxy.

## Acceptance criteria

| # | Input | Expected result |
|---|---|---|
| AC1 | `irrigation_strategy` absent (stored config from CH01) or `'hysteresis'`; tomato crop; readings 59 (off), 71 (on), 65 (on) | Identical to CH01: `output_on`, `output_off`, no command. |
| AC2 | `time_window`, windows `05:00-09:00,18:00-21:00`, tomato; dry reading 55 at 06:30 / at 12:00 (pump off) / at 12:00 (pump on) / 71 at 20:00 (pump on) | 06:30 → `output_on`; 12:00 off → no command; 12:00 on → `output_off` (window closed); 20:00 wet → `output_off`. |
| AC3 (edge) | `time_window`, window `22:00-02:00` crossing midnight; dry reading at 23:30, 01:59, 02:00 | 23:30 → on, 01:59 → on, 02:00 → no command (end exclusive). |
| AC4 | `skip_if_rain`, threshold 60, tomato; dry reading 55 with rain indicator 80 (pump off), 80 (pump on), 60 (pump off), 20 (pump off) | 80 → no command; 80 with pump on → `output_off`; 60 → no command (≥ threshold skips); 20 → `output_on`. The rain indicator is read from the selected rain measurement with `rain_max_age`. |
| AC5 (edge) | `skip_if_rain`, the rain reading is missing (`[ts, None]`); dry soil | Falls back to the band decision → `output_on`, and a warning is logged. |
| AC6 (error) | Invalid windows: `'25:00-26:00'`, `'abc'`, `''`, `'06:00-06:00'`, `'06:00-07:00,'` | `parse_time_windows` raises `ValueError`. A Function configured with `'abc'` logs an error at start-up and uses plain `hysteresis` (dry at 12:00 → `output_on`). |
| AC7 (error) | Unknown stored strategy `'flood'`; or `skip_if_rain` with no rain measurement selected | An error is logged at start-up and plain `hysteresis` is used. |
| AC8 | A developer composes strategies with the single creation point and the decorator classes: `RainSkipStrategy(TimeWindowStrategy(LowerHysteresisStrategy(), …), 60)` | The composed strategy applies every restriction and works with either direction. The `lower` direction plus a time window decides mirrored inside the window and switches off outside it. |
| AC9 | `FUNCTION_INFORMATION['custom_options']` | It offers `irrigation_strategy` (select, default `'hysteresis'`, choices = `IRRIGATION_STRATEGY_CHOICES`), `irrigation_windows`, `rain_measurement`, `rain_threshold` and `rain_max_age`, none of them required. All existing options keep their id, type and default. |

## Expected pattern effect

- **Newly introduced – Strategy "Irrigation Decision Strategy".**
  - Strategy: `IrrigationStrategy.decide(context)`.
  - ConcreteStrategies: `RaiseHysteresisStrategy` and `LowerHysteresisStrategy` (introduced by the
    step-b refactoring), plus `TimeWindowStrategy` and `RainSkipStrategy` (step c).
  - Context: `bang_bang.CustomModule`, which holds the strategy and turns its decision into
    `DaemonControl` calls.
  - Selection: `build_irrigation_strategy` is the one creation point.
- **Newly introduced – Decorator "Irrigation Restriction Decorators".**
  - Component: `IrrigationStrategy`.
  - ConcreteComponents: the two hysteresis strategies.
  - Decorator: `IrrigationRestriction`, which holds `inner` and delegates `decide`.
  - ConcreteDecorators: `TimeWindowStrategy` and `RainSkipStrategy`, which add restrictions around any
    wrapped strategy and can be stacked.
  - This is a separate collaboration from the Strategy above: wrapper → wrapped component, as opposed
    to context → strategy.
- *Module Initialization with Retry* (Template Method): `CustomModule.initialize` now builds the
  strategy → **modified**.
- *Daemon RPC Client* (Proxy): the client `CustomModule.loop` is restructured and the new
  `_apply_decision` issues the same `output_on` / `output_off` calls → **modified**.
- *Daemon Module Base* (Layer Supertype): the new options are parsed by the inherited
  `setup_custom_options` without change → **preserved**.
- The other Part 1 instances → **preserved**.

## Refactoring (step b)

- **Smell: Switch Statements** (Fowler). `loop()` branches on the type code `self.direction` with an
  `if 'raise' / elif 'lower' / else` chain whose two branches are mirror images
  (`mycodo/functions/bang_bang.py:220-243` in `Part2/changes/Change1/code/`; the mirrored blocks are
  221-230 and 232-241). Every new irrigation policy would add another branch to this chain.
- **Technique: Replace Conditional with Polymorphism.** The new plain-Python module
  `mycodo/utils/irrigation_strategies.py` provides `IrrigationStrategy` with `RaiseHysteresisStrategy` /
  `LowerHysteresisStrategy` and the lookup `DIRECTION_STRATEGIES`. `loop()` asks the strategy for a
  decision and the extracted `_apply_decision()` performs it. An unknown direction still logs
  `Unknown controller direction: '…'` from `loop()`. All characterization tests must pass unchanged.

## Pattern effects (after CH02)

> Line numbers refer to `Part2/changes/Change2/code/`. `bang_bang.py` = `mycodo/functions/bang_bang.py`,
> `irrigation_strategies.py` = `mycodo/utils/irrigation_strategies.py`.

| Instance name | Pattern | Status | Participants added/changed/removed | Reason |
|---|---|---|---|---|
| Sensor Measurement Acquisition | Template Method | preserved | – | Not touched. |
| Module Initialization with Retry | Template Method | modified | Changed: ConcreteClass `bang_bang.CustomModule` (183-361). `initialize()` (225-244) now also builds the irrigation strategy through the new `_build_irrigation_strategy()` (246-268). | Same roles and the same `try_initialize` → `initialize` skeleton; only the code inside one concrete step changed. |
| Controller Thread Lifecycle | Template Method | preserved | – | Not touched. |
| Output Actuation (irrigation switching) | Template Method | preserved | – | Not touched; the strategies still drive the pump only through `output_on` / `output_off`. |
| Formula Setpoint Plot Sampling | Template Method | preserved | – | Not touched. |
| Date/Daily Setpoint Interpolation | Template Method | preserved | – | Not touched. |
| Setpoint Schedule Calculation | Strategy | preserved | – | Not touched. It is a different collaboration from the new irrigation Strategy. |
| Sensor Driver Adaptation | Adapter | preserved | – | Not touched. |
| Daemon RPC Client | Proxy | modified | Changed: Client `bang_bang.CustomModule.loop` (284-320). The `output_on` / `output_off` calls moved into the new `_apply_decision()` (341-350); `output_state` is still at 300 and the missing-value `output_off` at 307. | The Proxy and its forwarded calls are unchanged; the client code was restructured and moved. |
| Automation/Alert Actions | Command | preserved | – | Not touched. |
| Input/Output Module Loading | Plugin | preserved | – | Not touched. The new module is in `mycodo/utils/`, so the plugin scanner does not load it. |
| Daemon Module Base | Layer Supertype | preserved | – | The five new options are parsed by the inherited `setup_custom_options` without change. |
| User and Role Persistence | Active Record | preserved | – | Not touched. |
| **Irrigation Decision Strategy** | Strategy | newly_introduced | Added: Strategy `IrrigationStrategy` (irrigation_strategies.py:45-54), operation `decide`; ConcreteStrategies `RaiseHysteresisStrategy` (57-65), `LowerHysteresisStrategy` (68-76) (both from the step-b refactoring), `TimeWindowStrategy` (104-114) and `RainSkipStrategy` (117-130) (step c); parameter object `IrrigationContext` (36-42); selection `DIRECTION_STRATEGIES` (80-83) and `build_irrigation_strategy` (166-181); Context `bang_bang.CustomModule`: holds `self.strategy` (set at 228), calls `self.strategy.decide(...)` in `loop` (314) and executes the result in `_apply_decision` (341-350). | Replaces the `direction` if/elif (Switch Statements). The policy is now an interchangeable object chosen at start-up; new policies need no change to `loop()`. |
| **Irrigation Restriction Decorators** | Decorator | newly_introduced | Added: Component `IrrigationStrategy` (45-54); ConcreteComponents `RaiseHysteresisStrategy` (57-65), `LowerHysteresisStrategy` (68-76); Decorator `IrrigationRestriction` (86-101), which holds `inner` and delegates `decide` / `needs_rain_indicator`; ConcreteDecorators `TimeWindowStrategy` (104-114) and `RainSkipStrategy` (117-130); assembled by `build_irrigation_strategy` (166-181). | Each restriction wraps any strategy with the same interface, adds behaviour before delegating, and can be stacked (AC8). It is a separate collaboration (wrapper → wrapped component), not the context → strategy relation counted above. |

Counts after CH02: 15 instances (13 Part 1 instances + 2 newly introduced). Pattern types: Template
Method, Strategy, Adapter, Proxy, Command, Plugin, Layer Supertype, Active Record, Decorator = 9.
