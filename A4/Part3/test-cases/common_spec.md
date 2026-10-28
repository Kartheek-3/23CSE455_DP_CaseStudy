# Part 3 common test specification

Each pattern has one production snippet and a separate test runner in Java,
Python, JavaScript, and C++. The runners duplicate these small fixtures in their
native language; they do not read a shared JSON file. This document is the
language-independent contract used to compare the runners.

## Composite — Visibility Condition Tree

Initial entity map: `light.living_room=on`, `climate.ac=cool`,
`sensor.temperature=24.5`, `binary_sensor.motion=off`.

| Case | Condition | Expected |
| --- | --- | --- |
| C1 | `light.living_room == on` | true |
| C2 | `sensor.temperature > 30` | false |
| C3 | `light.living_room == on AND sensor.temperature >= 20` | true |
| C4 | `sensor.temperature < 20 OR binary_sensor.motion == on` | false |
| C5 | `NOT(binary_sensor.motion == on)` | true |
| C6 | `light.living_room == on AND (sensor.temperature > 25 OR NOT(binary_sensor.motion == on))` | true |

## Observer — Entity Subscription Notifications

Subscribe a dashboard widget and a notification logger. Publish, in order:

1. `light.living_room=on`, attributes `{brightness: 100}`.
2. `climate.thermostat=cool`, attributes `{temperature: 21.5}`.
3. `sensor.smoke=emergency`, attributes `{battery: 95}`.
4. Unsubscribe the logger.
5. `light.kitchen=off`, attributes `{brightness: 0}`.

Expected: the widget receives four notifications; the logger receives three and
does not receive the kitchen event; the hub retains `light.living_room=on` and
`sensor.smoke=emergency`.

## Memento — Hearth Configuration History

Use capacity 3 and these configurations:

- `s0 = (Home, dark, [clock, weather])`
- `s1 = (Living Room, dark, [clock, weather, light])`
- `s2 = (Master Suite, light, [clock, light])`

Push `s0` and `s1`, set current state to `s2`, and check undo is available while
redo is not. Undo must restore `s1`; redo must restore `s2`. Enter edit mode,
replace the current state with `(Corrupted, neon, [])`, then cancel and expect
`s2`. Push four states into the bounded history and expect exactly three undo
entries. Clear the manager and expect no undo, no redo, and zero undo entries.

## Strategy — Visibility Condition Evaluator

Entity map: `light.patio=on`, `sensor.lux=150`, `device.battery=85`;
environment: `screenWidth=1024`.

| Case | Strategy input | Expected |
| --- | --- | --- |
| S1 | state: patio expected `on` | true |
| S2 | state: patio expected `off` | false |
| S3 | numeric: lux `> 100` | true |
| S4 | numeric: battery `<= 20` | false |
| S5 | screen width in inclusive range 768–1200 | true |
| S6 | registered `battery_ok` predicate checks battery `> 50` | true |

## Factory Method — Entity Domain Modal

| Entity ID | Expected product domain | Expected action |
| --- | --- | --- |
| `light.kitchen` | light | `RENDER_LIGHT_CONTROLS` |
| `switch.water_heater` | switch | `RENDER_SWITCH_TOGGLE` |
| `sensor.living_room_temp` | sensor | `RENDER_SENSOR_GRAPH` |
| `climate.main_floor` | climate | `RENDER_CLIMATE_HVAC` |
| `unknown_domain.device_123` | unknown_domain | `RENDER_GENERIC_ATTRIBUTES` |

## Template Method — Canvas Rendering

Render both viewer and editor with width 1000, height 750, scale 1.2, zoom 2.0,
background `floorplan_ground.png`, and elements
`[light.living_room, sensor.kitchen_temp, camera.entryway]`.

Expected: effective scale 2.4 for each; three rendered elements for each;
viewer overlay `PASSIVE_TOOLTIPS`; editor overlay
`INTERACTIVE_TRANSFORM_HANDLES`; viewer does not record an edit snapshot and
editor does.

## Coverage limits

The cases include positive and negative outcomes, nested composition, observer
unsubscription, history bounds/rollback, an unknown-domain fallback, and the
viewer/editor variation hook. They do not define a shared exception contract or
systematically test malformed inputs, concurrency, or performance under load.
The recorded millisecond values are therefore microbenchmarks of these small
runner bodies, not end-to-end application performance.
