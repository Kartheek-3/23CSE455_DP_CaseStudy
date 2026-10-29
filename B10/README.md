# Design Patterns Case Study – Mycodo

23CSE455 Design Patterns case study, team folder **B10**.

## Team B10

| Roll number | Name | Batch |
|---|---|---|
| AM.SC.U4AIE23038 | Johan Rajesh | AIE - A |
| AM.SC.U4AIE23003 | Aadarsh Jayan Nair | AIE - A |
| AM.SC.U4AIE23029 | Dano Aby Alex | AIE - A |
| AM.SC.U4AIE23140 | P Arya | AIE - B |

The report is `B10_Report.pdf` (LaTeX source `B10_Report.tex`); the slides are `Part3/llm/B10_slide.pdf`.

## Application and source

| Item | Value |
|---|---|
| Application | Mycodo – Flask-based environmental monitoring and regulation system, used here as an agriculture management application |
| Source URL | https://github.com/kizniche/Mycodo.git |
| Version / baseline commit | v8.17.0, `ee70a111c622e2a81026fd5c1553a948acf8161e` ("v8.17.0 Release") |
| License | GPL-3.0 (`data/code/LICENSE.txt`) |
| Original source (read-only) | `data/code/` – the baseline checkout without its `.git` folder |

### Source commits

**Part 1** and **Part 3** use the baseline commit only; `data/code/` is never modified.

**Part 2** builds on the baseline in `Part2/code/` (branch `case-study`). It adds nine commits, three per change:

| Commit | Message | Patch file in `Part2/changes/commits/` |
|---|---|---|
| `ee70a111c` | v8.17.0 Release (baseline) | – |
| `dee5d7d76` | CH01: characterization tests | `0001-...patch` |
| `d454803d0` | CH01 refactoring: Extract Method | `0002-...patch` |
| `bdc43f9a3` | CH01: crop profiles for the bang-bang irrigation controller | `0003-...patch` |
| `fb1794585` | CH02: characterization tests | `0004-...patch` |
| `c18ecb1e5` | CH02 refactoring: Replace Conditional with Polymorphism | `0005-...patch` |
| `9e3d56e8d` | CH02: time-window and skip-if-rain irrigation strategies | `0006-...patch` |
| `1146fe42a` | CH03: characterization tests | `0007-...patch` |
| `349ed087c` | CH03 refactoring: Extract Method | `0008-...patch` |
| `bce41febb` | CH03: sensor alerts with log and e-mail listeners | `0009-...patch` |

`Part2/code/` is the source after CH03 (no `.git` folder, so it can be uploaded). The snapshot of the scope
files after each change is in `Part2/changes/ChangeN/code/`. To rebuild the history:

```bash
git clone https://github.com/kizniche/Mycodo.git && cd Mycodo
git checkout -b case-study ee70a111c622e2a81026fd5c1553a948acf8161e
git am <team folder>/Part2/changes/commits/*.patch
```

## Environment versions

| Tool | Version | Notes |
|---|---|---|
| OS | Microsoft Windows [Version 10.0.26300.9550] | commands run from Git Bash (MINGW64) |
| Python | 3.12.7 | on PATH; Part 2 uses the venv `<venv>` (see Paths below) |
| Java | OpenJDK 21.0.2 (javac 21.0.2) | `<jdk21>`, set as `JAVA_HOME` for the tools (the `java` on PATH is 1.8.0_461) |
| Node.js | v23.11.0 | on PATH |
| C++ | MinGW g++ 6.3.0 | `-std=c++14` (C++17 is not fully supported) |
| lizard | 1.24.1 | dev tool, installed with pip in the venv |
| pytest | 9.0.2 | dev tool (Part 2) |

The Part 2 venv contains only the pinned packages from `install/requirements.txt` that are needed to import the touched modules:

```
Flask==3.1.2 Flask_Babel==4.0.0 Flask_Login==0.6.3 Flask_Marshmallow==1.3.0 Flask_SQLAlchemy==3.1.1
SQLAlchemy==2.0.45 marshmallow_sqlalchemy==1.4.2 bcrypt==5.0.0 pyro5==5.16 requests==2.32.5
pytest==9.0.2 lizard==1.24.1
```

The full list is in `Part2/llm/run_info.txt`. Part 3 uses the standard library only.

**Paths.** Every path in this folder (CSVs, README files, logs, LLM records) is relative to the team
folder `B10/`. Tools outside the team folder appear only as placeholders:

| Placeholder | Meaning |
|---|---|
| `B10` | this team folder (in raw records made before the move it was the folder `Case_study`) |
| `<venv>` | the Part 2 Python venv `.venv-mycodo`, kept in a parent folder of `B10/` and found automatically by the tools |
| `<jdk21>` | the OpenJDK 21.0.2 installation; set `JAVA_HOME=<jdk21>` (or put its `bin` first on PATH) before running the Java commands or tools |
| `<host>` | the name of the Windows PC that ran all measurements |

Machine-specific absolute paths and the computer name in logs and raw LLM records were replaced by these
placeholders on 2026-10-25; nothing else in those files was changed.

## Repository layout

| Path | Contents |
|---|---|
| `README.md`, `B10_Report.pdf`, `B10_Report.tex` | This file and the report |
| `data/code/` | Original application source at the baseline commit |
| `data/test_result/` | Test re-run of 2026-10-25: raw logs, PNG captures and `run_all_tests.py` (see its `README.md`) |
| `Part1/` | `patterns.csv`, `Pattern_count.csv`, `pattern_architecture/` (Mermaid `.mmd` source + `.png`), `llm/` (prompts, `input.txt`, `output.txt`, `run_info.txt`), `llm.csv` |
| `Part2/` | `code/` (evolved source), `changes/Change1-3/` (requirement, diffs, test results, demo), `changes/commits/` (patches), `pattern_evolution.csv`, `Pattern_count.csv`, `diagrams/`, `llm/`, `tools/`, `llm.csv` |
| `Part3/` | 8 pattern folders × `java/ python/ javascript/ cpp/` (snippet, test runner, README), `test-cases/`, `evidence/`, `tools/`, `llm/` (`pattern_crosslanguage.csv`, `llm.csv`, prompts, `B10_slide.pdf`) |

Each CSV exists once. All CSV paths are relative to this team folder.

**LLM folders.** Every part has the same `llm/` layout: the members' prompts (`partN_prompt_<name>.txt`),
`input.txt` (files supplied), `output.txt` (raw model output) and `run_info.txt` (model, date, environment).
Each member ran each part with their own prompt and the results were compared and combined into one team
result; each part's `llm.csv` records the evaluation of that result.

## Inspected modules

These 24 files are the Part 1 scope. The paths are relative to `data/code/`.

| Area | Files |
|---|---|
| Core abstractions | `mycodo/abstract_base_controller.py`, `mycodo/databases/__init__.py` |
| Sensor management | `mycodo/inputs/base_input.py`, `mycodo/inputs/adafruit_i2c_soil.py`, `mycodo/controllers/base_controller.py`, `mycodo/controllers/controller_input.py`, `mycodo/utils/inputs.py` |
| Weather | `mycodo/inputs/weather_openweathermap_weather.py` |
| Irrigation / outputs | `mycodo/outputs/base_output.py`, `mycodo/outputs/pump_gpio.py`, `mycodo/outputs/on_off_gpio.py`, `mycodo/utils/outputs.py`, `mycodo/functions/base_function.py`, `mycodo/functions/bang_bang.py` |
| Setpoint schedules | `mycodo/utils/method.py` |
| Module loading | `mycodo/utils/modules.py` |
| Alerts | `mycodo/controllers/base_conditional.py`, `mycodo/controllers/controller_conditional.py`, `mycodo/actions/base_action.py`, `mycodo/actions/email.py`, `mycodo/actions/output_on_off.py` |
| UI-to-daemon communication | `mycodo/mycodo_client.py` |
| User management | `mycodo/databases/models/user.py`, `mycodo/databases/models/role.py` |

Excluded: the Flask UI (`mycodo/mycodo_flask/`), the daemon server, the other ~400 input/output/function
modules and the database migrations. They are outside the agriculture scenario or only repeat the same
base-class collaborations.

Two of the parts also cover further files:

**Part 2**
- `mycodo/functions/bang_bang.py` is the only original file that was changed.
- The new modules are `mycodo/utils/crop_profiles.py`, `mycodo/utils/irrigation_strategies.py` and `mycodo/utils/sensor_alerts.py`.

**Part 3**
- It also reads `mycodo/inputs/sensorutils.py` (`calculate_dewpoint`), `mycodo/utils/send_data.py` and `mycodo/utils/actions.py`.

`Part2/llm/input.txt` and `Part3/llm/input.txt` list the exact files and line ranges read.

## Run / test commands

All commands start in the team folder unless a working folder is given.

### Part 1

Part 1 is an analysis only; there is nothing to run. The results are `Part1/patterns.csv` and
`Part1/Pattern_count.csv`; the raw model output is `Part1/llm/output.txt`.

### Part 2 – case-study tests (working folder `Part2/code`)

The tests run on Windows without a full Mycodo installation.

```bash
PY="<venv>/Scripts/python.exe"   # replace <venv> with the venv path (see Paths)
cd Part2/code
$PY -m pytest -p no:cacheprovider -v mycodo/tests/case_study
# expected: 83 passed
cd ../changes/Change1 && $PY demo.py   # same for Change2, Change3
```

### Part 3 – each runner is run from its own language folder

```bash
# Java (example: Strategy) - JDK 21 must be first on PATH
cd Part3/strategy_setpoint_schedule/java
javac -d out AbstractMethod.java SetpointScheduleTest.java
java -cp out SetpointScheduleTest

# Python
cd Part3/strategy_setpoint_schedule/python && python test_setpoint_schedule.py

# JavaScript
cd Part3/strategy_setpoint_schedule/javascript && node test_setpoint_schedule.js

# C++
cd Part3/strategy_setpoint_schedule/cpp
g++ -std=c++14 -O2 -Wall -o test_setpoint_schedule.exe test_setpoint_schedule.cpp && ./test_setpoint_schedule.exe
```

Every language folder has a `README.md` with its exact commands. Every runner ends with
`<Pattern> tests: X/Y passed` and exits with code 0 when all cases pass. Compiled files (`out/`, `*.exe`)
are not uploaded; the commands above recreate them.

To run everything at once, run these from `Part3/`:

```bash
python tools/run_tests.py        # compile + run all 32 runners -> evidence/tests_*.txt
python tools/run_lizard.py       # LOC / complexity -> evidence/lizard_*.txt
python tools/measure.py          # timing -> evidence/timings_*.txt
python tools/collect_results.py  # -> llm/pattern_crosslanguage.csv
```

### Everything (Part 2 + Part 3)

```bash
python -B data/test_result/run_all_tests.py   # writes data/test_result/*.txt, removes compiled files
```

Last result (2026-10-25): Part 2 83/83 passed, 3 demos exit code 0; Part 3 32/32 runners passed.

## LOC / complexity / timing rules

- **Tool:** lizard 1.24.1.
  - **LOC** = lizard NLOC (non-blank, non-comment lines).
  - **Complexity** = lizard cyclomatic complexity (CCN) per function; `max_function_cc` is the highest.
  - The raw lizard output is always saved, and numbers are never edited by hand.
- **Part 2 metrics** (`Part2/changes/metrics.csv`):
  - lizard runs on the 24 Part 1 scope files plus each new module (`Part2/changes/metrics_files.txt`). For
    each version it reports files, NLOC, functions, max CCN and average CCN, extracted from
    `Part2/changes/metrics.log`.
  - The versions are the original code and the code after each change.
- **Part 3 metrics:**
  - lizard runs on the **production file only** (tests are separate files). `source_loc` = NLOC of that
    file; `max_function_cc` = the highest CCN of any function in it.
- **Part 3 timing:**
  - Compile first (javac / `g++ -std=c++14 -O2`) outside the timed runs.
  - Run the test-runner process once as a warmup and five times measured, with `Part3/tools/measure.py`
    (`time.perf_counter` around `subprocess.run`).
  - Report the **median of the five runs in ms**. **The time includes the whole process: runtime start-up
    (JVM / CPython / Node / native), reading the test-case CSV and running all test cases.**
  - Every run is saved in `Part3/evidence/timings_*.txt`.

## Limitations

- **Static analysis only (Part 1).** Participants defined outside the scope are marked "defined outside
  scope": the daemon server, Flask views and DB helpers.
- **Judgement calls (Part 1/2).** Splitting Template Method into six collaborations, the overlap between
  Adapter and Template Method, "modified" for the Proxy and counting Strategy + Decorator separately in CH02
  are interpretations explained in the report.
- **Mocked environment (Part 2).** The tests run on Windows with mocks: the POSIX modules `grp`/`pwd` are
  stubbed, and the settings DB, the daemon and InfluxDB are mocked. They check the logic in
  `bang_bang.py`, not a running Mycodo daemon. The upstream Mycodo test suite was not run.
- **Raw LLM records keep old paths.** `llm/input.txt`, `output.txt` and `run_info.txt` are unedited raw
  records, so they still name the folders used at the time (`Mycodo/` = now `data/code/`, `Part2/work/` =
  now `Part2/code/`, `Part1/llm_output/` = now `Part1/llm/`).
- **Domain assumptions (Part 2).**
  - The crop values are illustrative and assume a percent soil-moisture measurement.
  - No bundled weather input provides rain data.
  - Alerts are edge-triggered, with the state kept in memory.
  - `bang_bang.py` is marked obsolete upstream.
- **Simplified snippets (Part 3).**
  - The database, hardware, network, Pyro5 and bcrypt are replaced by in-memory stand-ins. The bcrypt
    stand-in hash is **not secure**.
  - Source code that logs an error and aborts raises an exception in the snippets instead.
- **File sizes (Part 3).** The Java (68-113 NLOC) and C++ (82-130 NLOC) production files exceed the
  "about 30-90 lines" guideline because of type declarations.
- **Timing (Part 3).** The timings come from one Windows machine, with 9-12 tiny cases per run. They mostly
  reflect runtime start-up (native executable vs CPython, V8 and the JVM), not the speed of the pattern
  code.
