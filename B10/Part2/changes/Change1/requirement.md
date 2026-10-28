# Change 1 (CH01) – Add new crop types

## Requirement (case-study wording)

**CH01: Add new crop types.**

Interpretation for Mycodo: a farmer chooses a *crop type* (e.g. tomato, rice, wheat) for an irrigation
controller instead of typing raw numbers. The crop type supplies the target soil moisture and the
allowed tolerance. Developers add a new crop type in **one place**, without touching controller logic.

Code area (checked against baseline `ee70a111c622e2a81026fd5c1553a948acf8161e`):
`mycodo/functions/bang_bang.py`, class `CustomModule`, methods `initialize()` (lines 144-159) and
`loop()` (lines 161-210). With `direction='raise'` and a soil-moisture measurement, this on/off
hysteresis controller turns an irrigation output (e.g. `pump_gpio.OutputModule` used on/off) on when the
soil is dry and off when it is wet. The suggested starting point fits and is used unchanged.

Units: crop profiles express soil moisture in **percent (0-100)**. The bang-bang Function must therefore
use a percent soil-moisture measurement. A raw sensor value, such as the unitless capacitance from
`adafruit_i2c_soil`, must be rescaled to percent with the existing measurement rescaling
(`mycodo/utils/inputs.py` `rescale_measurements`). The numeric crop values are illustrative defaults for
the case study, not agronomic advice.

## Acceptance criteria

| # | Input | Expected result |
|---|---|---|
| AC1 | Bang-bang Function, option `crop_profile='tomato'`, direction `raise`; moisture readings 59, 71 (output on) and 65 | After initialization `setpoint == 65.0` and `hysteresis == 5.0`. 59 → `output_on`; 71 while on → `output_off`; 65 → no on/off command. |
| AC2 | Two Functions, `crop_profile='rice'` and `crop_profile='wheat'`; the same reading 70, output on | Each uses its own crop values (rice 85±5, wheat 50±5): rice → `output_on`, wheat → `output_off`. |
| AC3 | `crop_profile='custom'`, or the option missing from an existing stored configuration; setpoint 50, hysteresis 1 | Setpoint/hysteresis stay 50 / 1 (backward compatible); the decisions are identical to the characterization tests. |
| AC4 | A developer registers a new crop `CropProfile('lettuce', 'Lettuce', 70, 4)` with `register_crop_profile` | `get_crop_profile('lettuce')` returns it, `crop_profile_choices()` lists it, and a Function with `crop_profile='lettuce'` uses 70 / 4. `bang_bang.py` is not changed. |
| AC5 (error) | The stored configuration names an unknown crop (`crop_profile='banana'`) | No exception. An error naming the crop is logged; the configured setpoint/hysteresis are kept. `get_crop_profile('banana')` raises `UnknownCropProfileError`. |
| AC6 (edge/error) | Invalid crop definitions: tolerance ≤ 0, target outside 0-100, band (target ± tolerance) outside 0-100, empty id, reserved id `'custom'`, duplicate id | `ValueError` is raised; the registry is unchanged. |
| AC7 | `FUNCTION_INFORMATION['custom_options']` of the bang-bang Function | It contains a `crop_profile` select option (not required, default `'custom'`) whose choices are `'custom'` followed by every registered crop. |

## Expected pattern effect

- No new GoF pattern is needed. The crop catalogue is an immutable value type (`CropProfile`) plus one
  lookup point (`get_crop_profile`) and one registration point (`register_crop_profile`) in a new
  plain-Python module. It is deliberately **not** counted as a Factory: it returns existing objects and
  creates nothing, which is consistent with the Part 1 rejection of "Factory (plain function returning
  an object)".
- *Module Initialization with Retry* (Template Method): the concrete step
  `bang_bang.CustomModule.initialize` changes, because it now resolves the crop profile → **modified**.
- *Daemon RPC Client* (Proxy): its client `bang_bang.CustomModule.loop` is restructured by the
  refactoring; the calls to `DaemonControl` are unchanged → **modified**.
- *Daemon Module Base* (Layer Supertype): the new option is parsed by the inherited
  `setup_custom_options` without any change to the supertype → **preserved**.
- All other instances → **preserved**.

## Refactoring (step b)

- **Smell: Duplicated Code** (Fowler). `loop()` computes the control band edges four times:
  `self.setpoint + self.hysteresis` at `mycodo/functions/bang_bang.py:188` and `:205`, and
  `self.setpoint - self.hysteresis` at `:194` and `:199` (baseline line numbers). CH01 changes where
  setpoint and hysteresis come from, so these expressions are the code most affected by the change.
- **Technique: Extract Method**: two query methods, `_lower_threshold()` and `_upper_threshold()`,
  replace the four expressions. The behaviour is locked by the characterization tests (step a).

## Pattern effects (after CH01)

> Instance names are those of `Part1/patterns.csv`. Line numbers refer to `Part2/changes/Change1/code/`.

| Instance name | Pattern | Status | Participants added/changed/removed | Reason |
|---|---|---|---|---|
| Sensor Measurement Acquisition | Template Method | preserved | – | `inputs/base_input.py` and the input modules are untouched. |
| Module Initialization with Retry | Template Method | modified | Changed: ConcreteClass `bang_bang.CustomModule` (bang_bang.py:126-254); `initialize()` (161-178) now also calls the new helper `_apply_crop_profile()` (180-192). | Same roles and the same `try_initialize` → `initialize` skeleton; only the code inside one concrete step changed. |
| Controller Thread Lifecycle | Template Method | preserved | – | Not touched. |
| Output Actuation (irrigation switching) | Template Method | preserved | – | Not touched; the pump is still switched through `output_on` / `output_off`. |
| Formula Setpoint Plot Sampling | Template Method | preserved | – | Not touched. |
| Date/Daily Setpoint Interpolation | Template Method | preserved | – | Not touched. |
| Setpoint Schedule Calculation | Strategy | preserved | – | Not touched; crop profiles are static values, not time-based setpoint methods. |
| Sensor Driver Adaptation | Adapter | preserved | – | Not touched. |
| Daemon RPC Client | Proxy | modified | Changed: Client `bang_bang.CustomModule.loop` (now bang_bang.py:194-243); its threshold expressions were replaced by `_lower_threshold()` / `_upper_threshold()` (245-251). | The calls to the Proxy (`output_state`, `output_on`, `output_off`) are unchanged; only the client's code and line positions changed. |
| Automation/Alert Actions | Command | preserved | – | Not touched. |
| Input/Output Module Loading | Plugin | preserved | – | Not touched. `crop_profiles.py` is placed in `mycodo/utils/`, not `mycodo/functions/`, so the Function plugin scanner does not treat it as a plugin. |
| Daemon Module Base | Layer Supertype | preserved | – | The new `crop_profile` option is parsed by the inherited `AbstractBaseController.setup_custom_options`; the supertype code did not change. |
| User and Role Persistence | Active Record | preserved | – | Not touched. |

No new pattern instance. `mycodo/utils/crop_profiles.py` (`CropProfile` 27-43, `register_crop_profile`
49-54, `get_crop_profile` 62-67, `crop_profile_choices` 70-73) is a value type plus one registration
and lookup point. It is not counted as a Factory (nothing is created) or as any other catalogue
pattern.
