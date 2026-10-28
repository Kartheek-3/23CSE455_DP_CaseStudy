# Change 3 (CH03) – Add sensor-based alerts

## Requirement (case-study wording)

**CH03: Add sensor-based alerts.** (Builds on CH01 crop profiles and CH02 irrigation strategies.)

Interpretation for Mycodo: the bang-bang irrigation Function raises **alerts** from its sensor
readings. Interested **listeners** are notified:

| Alert kind | Raised when | Cleared when |
|---|---|---|
| `missing_measurement` | No usable soil-moisture reading: `[ts, None]`, `None` or an empty result. The output is still switched off, as before. | A valid reading arrives. |
| `critically_dry` | The reading is below the configured critical moisture `alert_critical_moisture` (0 = disabled). | A reading at or above the critical level arrives. |

Each alert is delivered **once per episode**. It is not repeated every update period while the
condition lasts, which would flood e-mail; it is raised again after the condition has cleared and
returned. Listeners:

- **LogAlertListener**: always attached; writes a warning to the Function's log.
- **EmailAlertListener**: attached when `alert_email` lists recipients. It reuses Mycodo's existing
  e-mail path `DaemonControl.send_email` (`mycodo/mycodo_client.py:270-276`), which reads the SMTP
  settings and calls `mycodo.utils.send_data.send_email`.

A failing listener (e.g. the SMTP server is down) must not stop the other listeners or the irrigation
control.

Code area (code before CH03 = `Part2/changes/Change2/code/`): `mycodo/functions/bang_bang.py`,
`CustomModule.loop()` (lines 284-320) and `initialize()` (225-244). The suggested starting point fits.

## Acceptance criteria

| # | Input | Expected result |
|---|---|---|
| AC1 | `alert_email='grower@example.com'`; reading `[ts, None]`, output on | `output_off` is sent (unchanged). One `missing_measurement` alert is delivered: a warning `ALERT [missing_measurement] …` in the log, and `send_email(['grower@example.com'], <message>, subject='Mycodo alert: missing_measurement')`. |
| AC2 (error) | `get_last_measurement` returns `None` or `[]` | No exception (the baseline raised `TypeError` / `IndexError` at the debug log). `output_off` is sent and the `missing_measurement` alert is raised. |
| AC3 | `alert_critical_moisture=40`, tomato crop; reading 35, pump off | The pump decision is unchanged (`output_on`), and a `critically_dry` alert with `value == 35` is delivered. |
| AC4 | Readings 35, 34, 50, 33 with critical 40; and missing, missing, 50, missing | `critically_dry` is delivered at the 1st and 4th reading only (once per episode). The same holds for `missing_measurement`. |
| AC5 | `alert_email` empty / absent vs `' a@x.com, b@y.com '` | Empty: only `LogAlertListener` is attached and `send_email` is never called. Two addresses: an `EmailAlertListener` with recipients `['a@x.com', 'b@y.com']`. |
| AC6 (error) | The e-mail listener raises (`send_email` throws), critical 40, reading 35 | The error is logged by the notifier, the log listener still receives the alert, `loop()` does not raise and `output_on` is still sent. |
| AC7 (edge) | `alert_critical_moisture` absent or 0; reading 1 | No `critically_dry` alert. With the default options, `loop()` sends exactly the same daemon calls as before (`output_state`, `output_on`). |
| AC8 | A developer attaches a custom `AlertListener` subclass, then detaches it | The listener receives alerts while attached and none after `detach`. No change to `bang_bang.py` is needed. |
| AC9 | `FUNCTION_INFORMATION['custom_options']` | It offers `alert_critical_moisture` (float, default 0) and `alert_email` (text, default `''`), both optional. The existing options are unchanged. |

## Expected pattern effect

- **Newly introduced – Observer "Sensor Alert Notification".**
  - Subject: `SensorAlertNotifier` (`attach`, `detach`, `raise_alert`, `clear`, `_notify`).
  - Observer: `AlertListener.on_alert`.
  - ConcreteObservers: `LogAlertListener`, `EmailAlertListener`.
  - Event / state: `SensorAlert`.
  - Client that changes the subject's state: `bang_bang.CustomModule`. It creates the subject and
    attaches the listeners in `_setup_alert_listeners()`, and raises or clears alerts in
    `_handle_missing_measurement()` / `_check_critically_dry()`.
- *Module Initialization with Retry* (Template Method): `CustomModule.initialize` now also sets up the
  listeners → **modified**.
- *Daemon RPC Client* (Proxy): the client `loop()` is restructured and `output_off` moves into the
  extracted `_handle_missing_measurement()` → **modified**. The e-mail goes through
  `DaemonControl.send_email`, which runs locally and is not forwarded to the daemon, so it is not a
  Proxy forward.
- *Irrigation Decision Strategy* (Strategy, CH02): its Context code (`CustomModule.loop`) changes lines;
  the strategy classes are unchanged → **modified**.
- *Irrigation Restriction Decorators* (Decorator, CH02): `irrigation_strategies.py` is unchanged →
  **preserved**.
- All other instances → **preserved**.

## Refactoring (step b)

- **Smell: Long Method** (Fowler). `loop()` is 37 lines (`mycodo/functions/bang_bang.py:284-320` in
  `Part2/changes/Change2/code/`) and mixes several concerns:
  - timer gating (285-289);
  - the output-channel guard (291-293);
  - reading the measurement (295-298);
  - the **inlined missing-measurement handling** (debug log at 302-303, guard / error / `output_off` at
    305-308);
  - strategy evaluation (310-320).

  CH03 has to add alerting exactly at the missing-measurement point.
- **Technique: Extract Method.** `_period_elapsed()` (timer gating), `_read_measurement()` and
  `_handle_missing_measurement()` (error log + `output_off`) are extracted.
- The refactoring is purely structural. It deliberately keeps the debug log before the guard, so the
  baseline defect for a `None` / `[]` result is preserved here and fixed in step c (AC2). All tests must
  pass unchanged.

## Pattern effects (after CH03)

> Line numbers refer to `Part2/changes/Change3/code/` (identical to `Part2/code/`). `bang_bang.py` =
> `mycodo/functions/bang_bang.py`, `sensor_alerts.py` = `mycodo/utils/sensor_alerts.py`,
> `irrigation_strategies.py` = `mycodo/utils/irrigation_strategies.py`.

| Instance name | Pattern | Status | Participants added/changed/removed | Reason |
|---|---|---|---|---|
| Sensor Measurement Acquisition | Template Method | preserved | – | Not touched. |
| Module Initialization with Retry | Template Method | modified | Changed: ConcreteClass `bang_bang.CustomModule` (207-437); `initialize()` (252-272) now also calls `_setup_alert_listeners()` (390-396). | Same roles and skeleton; only the code inside one concrete step changed. |
| Controller Thread Lifecycle | Template Method | preserved | – | Not touched. |
| Output Actuation (irrigation switching) | Template Method | preserved | – | Not touched. |
| Formula Setpoint Plot Sampling | Template Method | preserved | – | Not touched. |
| Date/Daily Setpoint Interpolation | Template Method | preserved | – | Not touched. |
| Setpoint Schedule Calculation | Strategy | preserved | – | Not touched. |
| Sensor Driver Adaptation | Adapter | preserved | – | Not touched. |
| Daemon RPC Client | Proxy | modified | Changed: Client `bang_bang.CustomModule.loop` (312-343). The missing-measurement `output_off` moved into the extracted `_handle_missing_measurement()` (368-376, call at 371); `output_state` at 322; `_apply_decision` at 417-426. | Proxy calls unchanged; client code restructured and moved. The new `DaemonControl.send_email` use (396) is a local static method, not a forwarded remote call, so no Proxy participant is added. |
| Automation/Alert Actions | Command | preserved | – | Not touched. Alert e-mails do not use the Action modules; they share only the underlying `send_email` function through `DaemonControl.send_email`. |
| Input/Output Module Loading | Plugin | preserved | – | Not touched; the new module is in `mycodo/utils/`. |
| Daemon Module Base | Layer Supertype | preserved | – | The two new options are parsed by the inherited `setup_custom_options` without change. |
| User and Role Persistence | Active Record | preserved | – | Not touched. |
| Irrigation Decision Strategy | Strategy | modified | Changed: Context `bang_bang.CustomModule.loop` (312-343). It now passes the safely extracted `value` (from `_measurement_value`, 362-366) to `IrrigationContext`; `self.strategy.decide` is at 337. Strategy classes unchanged (irrigation_strategies.py:45-130). | Same roles; the Context's code changed and moved. |
| Irrigation Restriction Decorators | Decorator | preserved | – | `irrigation_strategies.py` is byte-identical to Change2. |
| **Sensor Alert Notification** | Observer | newly_introduced | Added: Subject `SensorAlertNotifier` (sensor_alerts.py:37-78: `attach` 49-51, `detach` 53-55, `raise_alert` 60-66, `clear` 68-70, `_notify` 72-78); Observer `AlertListener` (29-34, `on_alert`); ConcreteObservers `LogAlertListener` (81-88) and `EmailAlertListener` (91-101); event `SensorAlert` (21-26). Client `bang_bang.CustomModule`: creates the subject and attaches observers in `_setup_alert_listeners` (390-396); changes the subject's state in `_handle_missing_measurement` (368-376), `_check_critically_dry` (378-388) and `loop` (330). | Listeners are decoupled from the controller: new alert channels are added by attaching another `AlertListener` without changing `bang_bang.py` (AC8). |

Counts after CH03: 16 instances (13 Part 1 + 3 newly introduced in CH02/CH03), 10 pattern types (adds
Observer).
