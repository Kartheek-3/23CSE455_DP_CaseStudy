# Part 3 – Shared problem specifications

Each section defines one small problem derived from a confirmed Mycodo pattern instance
(baseline `ee70a111c622e2a81026fd5c1553a948acf8161e`). All four implementations (Java, Python,
JavaScript, C++14) must follow this text. The test cases are in `test-cases/<problem>_cases.csv`.

## Common rules for all problems

**CSV format.** The first line is a header. Fields are separated by `,` and are never quoted. A
list inside a field is separated by `|`. Some problems use `;`, `:` or `=` for structure inside a
list item; this is defined per problem. Trailing `\r` characters must be ignored.

**Expected value `ERROR`.** The operation must raise or throw an error. Any exception type counts.

**Comparison.** Split the expected and actual strings into tokens at whitespace and at the characters
`| ; = , ( )`, and drop empty tokens.
- The token lists must have the same length.
- Two tokens that both match `^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$` are numbers and must differ by
  at most `1e-9`.
- All other tokens must be identical.

**Absent value** is written `None`. **Booleans** are written `true` / `false`.

**Runner output.**
- For each failing case, print `FAIL <case_id>: expected <x>, got <y>`.
- Finish with exactly one line, `<Pattern> tests: X/Y passed`.
- Exit with code 0 if all cases passed, and 1 otherwise.

---

## 1. Template Method – setpoint interpolation (`setpoint_interpolation_cases.csv`)

Source instance: *Date/Daily Setpoint Interpolation* (`mycodo/utils/method.py`, `DateMethod`,
`DailyMethod`).

A **method** holds an ordered list of **rows**. Each row has `time_start`, `time_end` (text),
`setpoint_start` (number) and `setpoint_end` (number, or absent).

`calculate_setpoint(now)` takes `now`, a text `YYYY-MM-DD HH:MM:SS`, and returns a pair
`(setpoint, ended)`.

Algorithm (the template, identical for both kinds):
1. If the hook `ignore_date()` is true, only the time-of-day of `now` is used.
2. Go through the rows **in order**. For each row, parse `time_start` and `time_end` **at that point**,
   so a later malformed row is never parsed if an earlier row matched.
   - `ignore_date()` false: the format is `YYYY-MM-DD HH:MM:SS`.
   - `ignore_date()` true: the format is `HH:MM:SS`.
3. If `start < now < end` (both strict):
   - `sp_end` = `setpoint_end`, or `setpoint_start` if absent.
   - `diff` = `|sp_end − setpoint_start|`.
   - `percent` = `(now − start) / (end − start)`, both in seconds.
   - The result is `setpoint_start + diff·percent` if `setpoint_start < sp_end`, otherwise
     `setpoint_start − diff·percent`. Return `(result, false)`.
4. If no row matches, return `(None, false)`. The `ended` flag is always `false`.

Kinds (hook `ignore_date`):

| Kind | Role | `ignore_date()` |
|---|---|---|
| `Date` (`DateMethod`) | defines the template and the default hook | `false` |
| `Daily` (`DailyMethod`) | subclass, overrides only the hook | `true` |

Formats: `YYYY-MM-DD HH:MM:SS` with a 4-digit year and 2-digit fields; month 01-12; the day must be
valid for the month (leap years: divisible by 4 and not by 100, or divisible by 400); hours 00-23,
minutes and seconds 00-59. Time of day is `HH:MM:SS` with the same field rules. Single-digit fields
are outside this spec.

Errors: a time text that does not match the required format, including a value out of range → error.

CSV columns: `case_id,method,rows,now,expected`.
- `rows` are separated by `|`. Each row is `time_start;time_end;setpoint_start;setpoint_end`, and an
  empty `setpoint_end` means absent.
- `expected` is `setpoint|ended`.

## 2. Strategy – setpoint schedule (`setpoint_schedule_cases.csv`)

Source instance: *Setpoint Schedule Calculation* (`mycodo/utils/method.py`: `AbstractMethod`,
`DailySineMethod`, `DurationMethod`, `CascadeMethod`, `create_method_handler`).

Every strategy offers `calculate_setpoint(now, start)` and returns `(setpoint, ended)`. `now` and
`start` are times in seconds.

- **AbstractMethod** (the neutral strategy): returns `(None, false)`.
- **DailySineMethod** `(amplitude, frequency, shift_angle, shift_y)`:
  - `sod = floor(now) mod 86400` (seconds of the day);
  - `angle = sod / 86400 · 360`;
  - `setpoint = amplitude · sin(radians(frequency · (angle − shift_angle))) + shift_y`;
  - `ended = false`.
- **DurationMethod** `(rows)`: each row is `(duration_sec, setpoint_start, setpoint_end)`. A row with
  `duration_sec = 0` is the **repeat row**, and its third value is `duration_end`.
  - `cycle` = sum of all `duration_sec`.
  - `repeat` = `duration_end` of the first repeat row, or absent if there is none.
  - `s = now − start`.
  - If `s ≥ cycle`:
    - if `repeat` is absent → `(None, true)`;
    - if `0 < repeat ≤ s` → `(None, true)`;
    - otherwise `s = s mod cycle`.
  - Walk the rows with a running total. For the row where `previous_total ≤ s < total`:
    - `percent = (s − previous_total) / duration_sec`;
    - interpolate from `setpoint_start` to `setpoint_end` exactly as in problem 1 (add if
      `setpoint_start < setpoint_end`, else subtract);
    - return `(value, false)`.
  - Precondition: `now ≥ start`.
- **CascadeMethod** `(linked strategies)` is the context that uses other strategies polymorphically:
  - `p = 1`;
  - for each linked strategy in order: `(sp, ended) = linked.calculate_setpoint(now, start)`;
    if `sp` is not absent, `p = p · sp / 100`; then, if `ended`, return `(None, true)`;
  - finally return `(p · 100, false)`.
- **create_method_handler(type, rows, linked)** selects the strategy:
  - `DailySine` needs exactly one row of 4 numbers;
  - `Duration` needs rows of exactly 3 numbers each;
  - `Cascade` uses `linked`;
  - any other type → `AbstractMethod` (the fallback).
  - Wrong row sizes → error.

CSV columns: `case_id,method_type,params,now,start,expected`.
- For `DailySine` and `Duration`, `params` rows are separated by `|` and numbers by `;`.
- For `Cascade`, `params` is a `|` list of linked specs `Type:rows`, where the rows of a linked spec are
  separated by `/` and the numbers by `;`.
- `expected` is `setpoint|ended`.

## 3. Adapter – sensor driver (`sensor_driver_cases.csv`)

Source instance: *Sensor Driver Adaptation* (`AbstractInput`, `adafruit_i2c_soil.InputModule`,
`weather_openweathermap_weather.InputModule`).

**Target `AbstractInput`.**
- It holds the set of enabled channels and the measurement list of the input.
- `get_measurement()` returns a map `channel → value` (only channels that received a value), or
  `None` when no measurement is possible.
- `value_set(channel, value)`: if the value is absent, do nothing; if the channel is not enabled, do
  nothing; otherwise store the value as a decimal number.

**Adaptee `Seesaw`** (I²C soil driver stand-in) offers `moisture_read()` and `get_temp()`. A
configured raw value `IOERROR` makes that call raise an I/O error.

**Adapter `SoilInput`**:
- no sensor configured → `None`;
- if channel 0 is enabled → `value_set(0, moisture_read())`;
- if channel 1 is enabled → `value_set(1, get_temp())`.

Errors raised by the adaptee are **not** caught. The adaptee is only called for enabled channels.

**Adaptee `WeatherApi`** (HTTP stand-in): `get(url)` returns a response map, or raises a network error.

**Adapter `WeatherInput`** (config `api_key`, `city`):
- If `api_key` or `city` is empty → `None`.
- Otherwise call `get` with the URL
  `http://api.openweathermap.org/data/2.5/weather?appid=<key>&units=metric&q=<city>`.
- Inside one guarded block, any failure (network error, missing key) → `None`:
  - if `cod` is `404` → `None`;
  - otherwise read `temp`, `humidity`, `pressure`, `wind_speed`, `wind_deg` (a missing key is a
    failure).
- Set channel 0 temp, 1 humidity, 2 pressure, 4 wind speed, 5 wind direction (each only if enabled).
- Set channel 3 dew point only if channels 0, 1 **and** 3 are enabled:
  - constants `tn = 243.12`, `m = 17.62` if `temp ≥ 0`, else `tn = 272.62`, `m = 22.46`;
  - if `hum/100 ≤ 0` → 0;
  - else `tn·(ln(h)+m·t/(tn+t)) / (m − ln(h) − m·t/(tn+t))` with `h = hum/100`.

**Client** `update_measure(input)` calls `get_measurement()` through the Target type only.

CSV columns: `case_id,input,raw,enabled,expected`.
- `input` is `soil` or `weather`.
- `raw` is `key=value` items separated by `|`:
  - soil: `moisture`, `temp`, or the single item `unset` (no sensor);
  - weather: `api_key`, `city`, `cod`, `temp`, `humidity`, `pressure`, `wind_speed`, `wind_deg`, or
    `network=down`.
- `enabled` is a `|` list of channel numbers.
- `expected` is the channels with values, `channel=value` separated by `|` in ascending order, or `None`.

## 4. Proxy – daemon RPC (`daemon_rpc_cases.csv`)

Source instance: *Daemon RPC Client* (`mycodo/mycodo_client.py`, `DaemonControl`; Pyro5 `Proxy`).

**RealSubject `Daemon`** (in-memory stand-in for the Mycodo daemon). It has a `latency` in seconds
(simulated, no sleeping), a `health_message` (empty = healthy), and output states (default `off`).
- `check_daemon()` → `health_message`.
- `output_on(id, amount, channel)` → state `on`. Returns `0 Output <id> CH<channel> ON`, plus
  ` for <amount> s` if `amount > 0`.
- `output_off(id, channel)` → state `off`. Returns `0 Output <id> CH<channel> OFF`.
- `output_state(id, channel)` → `on` or `off`.

**Remote proxy `RemoteProxy`** (Pyro5 `Proxy` stand-in). It is created for a URI and has a
`timeout`. Each call:
- if no daemon is registered at the URI → `CommunicationError("cannot connect to <uri>")`;
- if `latency > timeout` → `RemoteTimeoutError("call exceeded <timeout> s timeout")`;
- otherwise forward the call.

**Proxy `DaemonControl(uri, timeout)`** (default timeout 30).
- `proxy(timeout)` creates a new `RemoteProxy` with that timeout, or the default.
- `output_on`, `output_off` and `output_state` forward through a new proxy. Errors propagate.
- `output_on_off(id, state, amount, channel)`:
  - state `on`, `1` or `true` → `output_on`;
  - `off`, `0` or `false` → `output_off`;
  - otherwise return `1 state not "on", 1, True, "off", 0, or False. Found: "<state>"`.
- `check_daemon()`: use a proxy whose timeout is set to **10** for this call.
  - A non-empty result is returned as is; an empty result → `GOOD`.
  - `RemoteTimeoutError` → `Pyro5 TimeoutError: <msg>`.
  - `CommunicationError` → `Pyro5 Communication error: <msg>`.
  - Any other error → `Pyro Exception: <msg>`.

CSV columns: `case_id,daemon,timeout,operations,expected`.
- `daemon`: `up`, `down` (not registered), `slow:<latency>`, or `unhealthy:<message>`.
- The URI is always `PYRO:mycodo@localhost:9080`.
- `timeout`: a number, or empty (default).
- `operations`: a `|` list of
  - `check_daemon`
  - `output_on:<id>:<channel>:<amount>`
  - `output_off:<id>:<channel>`
  - `output_state:<id>:<channel>`
  - `output_on_off:<id>:<channel>:<state>:<amount>`
- `expected`: the results joined with `|`, or `ERROR` if any operation raises.

## 5. Command – automation actions (`automation_actions_cases.csv`)

Source instance: *Automation/Alert Actions* (`actions/base_action.py`, `actions/email.py`,
`actions/output_on_off.py`).

A **request** (`dict_vars`) has an optional `message` (text) and a `value` map (text → text).

**Command `AbstractFunctionAction.run_action(dict_vars)`** returns `dict_vars`.

**EmailAction(email, receiver EmailService)**:
1. Recipients are `value.email_address` split at `;` if the key is present (an empty text gives an
   empty list), otherwise the configured `email` split at `,`.
2. Empty list → append ` Error: No recipients specified.` to `message` and return.
3. The body is `value.message` if present.
4. If `EmailService.check_allowed()`:
   - append ` Email '<email>'.` to `message` (the configured address, even if `value` overrode the
     recipients);
   - the body is otherwise the updated `message`;
   - call `EmailService.send_email(recipients, body)`.
5. If not allowed, `message` is unchanged.

**OutputOnOffAction(output_id, channel, state, duration, receiver OutputControl)**: `value` keys
`output_id`, `channel`, `state` and `duration` override the configuration.
- Unknown output id → append ` Error: Output with ID '<id>' not found.` and return.
- Otherwise append ` Turn output <id> CH<channel> (<output name>) <state>`, then ` for <duration> seconds`
  if the state is `on` and the duration is not 0, then `.`.
- Call `OutputControl.output_on_off(id, state, duration, channel)`.

Appending to a request without `message` is an error.

**Receivers.**
- `EmailService(hourly_max)`: `check_allowed()` is `sent_checks < hourly_max`; it then increments
  `sent_checks`. `send_email` logs `send_email to=<r1;r2;...> body=<body>`.
- `OutputControl(outputs: id → name)`: `output_on_off` logs
  `output_on_off id=<id> state=<state> amount=<duration> channel=<channel>`.

**Invoker `ActionInvoker`**: `register(action_id, action)` and `trigger_action(action_id, dict_vars)`.
An unknown id → error.

CSV columns: `case_id,action_id,config,value,message,expected_message,expected_log`.
- The runner registers `email-1` and `output-1` (built from `config`) on a fresh invoker per case.
- `config` / `value` are `key=value` items separated by `|`; a `;` inside a configured `email` stands
  for `,`.
- Output config defaults: outputs `pump1=Main Pump`; output_id `pump1`, channel `0`, state `on`,
  duration `0`; email `grower@farm.org`, `hourly_max=5`.
- `message` `-` = absent.
- `expected_log` is the receiver log entries joined with `|`, or `none`.

## 6. Plugin – module loading (`module_loading_cases.csv`)

Source instance: *Input/Output Module Loading* (`utils/modules.py`, `utils/inputs.py`
`parse_input_information`, `controllers/controller_input.py`).

**Module catalogue** (in-memory stand-in for files on disk). File name → module definition:

| File | Module |
|---|---|
| `adafruit_i2c_soil.py` | `INPUT_INFORMATION` `input_name_unique=ADAFRUIT_I2C_SOIL`, `input_manufacturer=Adafruit`, `input_name_short=Capacitive Moisture` |
| `weather_openweathermap_weather.py` | `OPENWEATHERMAP_CALL_WEATHER`, `Weather`, `OpenWeather City` |
| `soil_copy.py` | the same information as `adafruit_i2c_soil.py` (a duplicate) |
| `input_helpers.py` | no `INPUT_INFORMATION` |
| `broken_input.py` | loading raises |
| `bad_info.py` | `INPUT_INFORMATION` without `input_name_unique` |

Any other file name cannot be loaded.

**Loader** `load_module_from_file(path)` returns the module, or `None` when loading fails. It never
raises.

**Registry** `parse_input_information(files)`:
- For each file name in the given order:
  - skip excluded names (`__init__.py`, `__pycache__`, `base_input.py`, `custom_inputs`, `examples`,
    `scripts`, `tmp_inputs`, `sensorutils.py`);
  - load `inputs/<file>`; skip if `None` or without `INPUT_INFORMATION`.
  - If `input_name_unique` is missing → error.
  - If the name is already registered, record a duplicate error and continue. The later file
    **overwrites** `file_path` and the information.
- The result maps `input_name_unique → {file_path, input_manufacturer, input_name_short}`.

**Host** `InputController(registry).initialize(device)`:
- If the device is not in the registry → error (`'<device>' is not a valid device type.`).
- Otherwise load its `file_path` and create the module's `InputModule`.
- `describe()` returns `<input_manufacturer> <input_name_short>`.

CSV columns: `case_id,files,device,expected_registry,expected_device`.
- `files` is a `|` list (empty = no files).
- `expected_registry` is `NAME=file` entries sorted by name and joined with `|`, `none` for empty, or
  `ERROR`.
- `expected_device` is the `describe()` text, `ERROR`, or `-` when the registry step already failed.

## 7. Layer Supertype – module base (`module_base_cases.csv`)

Source instance: *Daemon Module Base* (`abstract_base_controller.py` `AbstractBaseController`;
members `AbstractInput`, `AbstractFunction`).

**Supertype `AbstractBaseController(unique_id, store)`** keeps `options` (a map), `errors` (a list
of logged messages) and an `OptionStore`.

`setup_custom_options(option_defs, stored)` (`stored`: name → text):
1. For each definition `(id, type, default_value, required)`, where any key may be absent:
   - Missing `type`, missing `id` (unless the type is `new_line` / `message`), or missing
     `default_value` (unless the type is `new_line`) → error (`ConfigurationError`). Processing stops.
   - Types `new_line` and `message` are skipped.
   - The value is the stored text if present, otherwise the default. A required option that is not
     stored → log one error and keep the default.
2. By type:
   - `integer` → integer; `float` → decimal; `bool` → `true` / `false`;
   - `text`, `select`, `multiline_text` → text;
   - `select_measurement`: a stored `dev,meas` gives `<id>_device_id = dev` and
     `<id>_measurement_id = meas`; otherwise both are `None`;
   - `select_device` → `<id>_id = text`;
   - any other type → log one error.

`_set_custom_option(table, unique_id, option, value)` / `_get_custom_option(table, unique_id, option)`
write and read the store, keyed by `(table, unique_id)`.

**Members.**
- `AbstractInput` (table `Input`) and `AbstractFunction` (table `CustomController`) inherit
  everything.
- Each adds `set_custom_option(option, value)` / `get_custom_option(option)`, which call the
  supertype methods with its own table.

CSV columns: `case_id,member,option_defs,stored,persist,expected`.
- `member`: `input` or `function`.
- `option_defs` is a `|` list of `id:type:default:required`; `!` = key absent; empty default = an
  empty text.
- `stored` is `name=value` items separated by `|`; a `;` in a value stands for `,`.
- `persist` is `-`, or `name=value`. The runner then calls `set_custom_option` on the member and reads
  the option back through the member (`stored=`) and through a member of the **other** table with the
  same `unique_id` (`other_table=`).
- `expected` is the options sorted by name as `name=value` joined with `|`, then `errors=<n>` if
  there are logged errors, then the persist results. `ERROR` if setup raises.

## 8. Active Record – user and role (`user_role_cases.csv`)

Source instance: *User and Role Persistence* (`databases/__init__.py` `CRUDMixin`,
`databases/models/user.py` `User`, `databases/models/role.py` `Role`).

**Session** (stand-in for `db.session` and the database). It holds committed rows per model and
pending changes.
- `add(obj)` and `delete(obj)` stage a change. Deleting an object that is not committed is an error.
- `commit()` applies the pending changes. A violated constraint → `IntegrityError`, and nothing is
  applied.
  - User: `name` and `email` unique.
  - Role: `name` required and unique.
- `rollback()` drops the pending changes.

**Active Record base `CRUDMixin`** (each record knows its session):
- `save()`: `add` + `commit`, return the record. On error: `rollback`, log, return `None`.
- `delete()`: `delete` + `commit`. On error: log only.

**User(name, email)**:
- `set_password(pw)` stores `hashpw(pw, gensalt())`.
- `check_password(pw, hashed)` (static) returns `hashpw(pw, hashed)`. The caller compares it with the
  stored hash.

**Role(name)**: a record with a required name.

Stand-in for bcrypt (std-lib only, **not secure**):
- `gensalt()` returns `$fnv$<8 random hex>$`.
- `hashpw(pw, salt_or_hash)`:
  - the salt is the part between the 2nd and 3rd `$`; the text must start with `$fnv$` and the salt
    must be non-empty, otherwise → error (`Invalid salt`);
  - the result is `$fnv$<salt>$<h>` where `h` = FNV-1a 32-bit of the UTF-8 bytes of `salt + pw`
    (offset `2166136261`, prime `16777619`), as 8 lowercase hex digits.

CSV columns: `case_id,operations,expected`. Operations (a `|` list, one fresh session per case):

| Operation | Result |
|---|---|
| `user:<name>:<email>:<pw>` | create, `set_password`, save → `saved` / `None` |
| `role:<name>` (`!` = no name) | save → `saved` / `None` |
| `delete_user:<name>` | delete the last created user with that name → `deleted`, or `error_logged` if the log grew |
| `delete_new:<name>` | create a user that is not saved and delete it → as above |
| `check:<name>:<pw>` | `match` / `no_match` |
| `check_hash:<pw>:<hash>` | the hash text |
| `count_users` / `count_roles` | number of committed rows |

`expected` is the results joined with `|`, or `ERROR` if any operation raises.
