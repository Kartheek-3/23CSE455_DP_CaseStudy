# Part 3: Cross-language comparison

Fifteen pattern types from Misskey, each with one representative instance implemented as a small equivalent program in Java, Python, JavaScript and C++: 60 snippets, each with its own test runner, all driven by one shared fixture per pattern.

- **Source:** Misskey, `https://github.com/misskey-dev/misskey`. The cited line ranges were read at commit `53ac6808ae4921305e761c545863ee6593edd1f4`, one commit after the Part 1 and Part 2 baseline `5f501341d49d2bc3fa7e817ce7548a82174326eb`.
- **Selection:** the 15 types of the Part 1 records that were confirmed against the source. Three Part 1 candidates (Mediator, Object Pool, the streaming connection factory) were left out as uncertain. Each pattern's README names its instance, source locations and what is modelled.
- **Result:** all 60 snippets pass all 97 shared cases (388 test executions) with no compiler warnings.

## Layout

```
Part3/
  code/pattern_<name>/README.md      instance, source locations, what is modelled and dropped
  code/pattern_<name>/<language>/    production file, test runner, README (java, python, javascript, cpp)
  test-cases/<pattern>.txt           shared fixture: one case per line
  evidence/                          environment, test logs, raw timings, lizard output, run_measurements.py
  llm/                               prompts, inputs, outputs, verification notes, llm.csv, pattern_crosslanguage.csv, slides
  A13_Part3_Report.pdf               Part 3 report
```

Datasets: `data/cross_language.csv` (60 rows) and `data/llm.csv`; `llm/pattern_crosslanguage.csv` and `llm/llm.csv` are the copies at the paths named in the assignment tree.

## How to run

One snippet: run the command from that language folder's README, for example Java:

```
cd Part3/code/pattern_strategy/java
javac -d build *.java
java -cp build LogManagerTest ../../../test-cases/strategy.txt
```

Everything (tests, timing, LOC and complexity, and the rows of `data/cross_language.csv`):

```
pip install lizard==1.24.1
python3 Part3/evidence/run_measurements.py [pattern ...]
```

## What is compared

A fixture line gives commands separated by `;` and the expected output (lines joined with `~`, errors as `ERR:<message>`). Each language's test runner turns the commands into calls on its snippet and compares the output string.

The snippets keep each pattern's roles and observable behaviour and drop what the framework provides (Redis, BullMQ, TypeORM, Fastify, Vue, the TypeScript type system); the pattern READMEs list the omissions. The Repository snippet models the collaboration with an in-memory store, not TypeORM.

Four instances are only partly supported by the source, and each README starts with a status line saying so: Factory (a simple factory function with one caller), Front Controller (Fastify registers one route per endpoint), Service Layer (one service read in detail), Repository (the abstraction comes from TypeORM). Adapter (one adapter exists) and Cache-Aside (its cache is itself two-level) carry smaller caveats. Cache-Aside and Two-Level Cache stay separate: Two-Level Cache is the cache infrastructure (memory in front of Redis), Cache-Aside is application code that reads the cache, queries the database and writes back.

## Measurement rules

| Measure | Rule |
|---|---|
| Source LOC | lizard NLOC of the production file: lines that are neither blank nor comment-only; tests excluded. Closing braces count. For C++, `#include` counts but `#pragma once` and `#define` do not |
| Max cyclomatic complexity | largest lizard CCN of any function in the production file; per-function values in `evidence/loc-cc/lizard_functions.csv` |
| Test result | `passed/total` printed by the runner on its documented command; logs in `evidence/test-logs/` |
| Median process time | wall-clock of one process that starts, reads the fixture, runs every case and exits; compile first, one warm-up run, five timed runs, median of the five; raw runs in `evidence/timing/raw_timing.csv` |
| Environment | `evidence/environment.txt`: OpenJDK 17.0.19, CPython 3.14.6, Node.js v24.15.0, g++ 16.1.1 (`-std=c++17 -Wall -Wextra`), lizard 1.24.1, one Linux x86_64 laptop (Intel i7-9750H) |

Timing includes process start-up, so it mostly compares runtime start-up (JVM, interpreter, native binary), not the patterns.

## Results (LOC / max CC / median ms)

| Pattern | Misskey instance | Cases | Java | Python | JavaScript | C++ |
|---|---|---|---|---|---|---|
| [Strategy](code/pattern_strategy/README.md) | Logging Output Strategy | 5 | 31 / 2 / 80.2 | 21 / 2 / 33.1 | 18 / 2 / 45.8 | 43 / 2 / 3.3 |
| [Factory](code/pattern_factory/README.md) | Logging Backend Factory | 6 | 23 / 4 / 83.1 | 14 / 4 / 23.9 | 14 / 4 / 47.3 | 33 / 4 / 3.4 |
| [Adapter](code/pattern_adapter/README.md) | Telemetry Backend Adapter Layer | 8 | 52 / 2 / 89.1 | 36 / 2 / 24.5 | 26 / 2 / 45.4 | 55 / 2 / 3.7 |
| [Template Method](code/pattern_template_method/README.md) | Misskey Chart Processing Framework | 5 | 37 / 4 / 82.3 | 27 / 4 / 23.8 | 25 / 4 / 47.8 | 36 / 4 / 3.3 |
| [Proxy](code/pattern_proxy/README.md) | AnalyticsProxy | 5 | 28 / 2 / 77.1 | 29 / 2 / 24.7 | 17 / 3 / 45.6 | 28 / 2 / 3.6 |
| [Observer](code/pattern_observer/README.md) | PreferencesManager Observer | 8 | 22 / 3 / 93.3 | 18 / 4 / 27.3 | 13 / 3 / 46.1 | 35 / 4 / 3.4 |
| [Two-Level Cache](code/pattern_two_level_cache/README.md) | RedisSingleCache L1/L2 Cache | 7 | 68 / 3 / 89.0 | 47 / 3 / 24.2 | 56 / 3 / 50.0 | 67 / 3 / 3.3 |
| [Cache-Aside / Lazy Loading](code/pattern_cache_aside/README.md) | Federated Instance Cache-Aside | 7 | 49 / 3 / 87.4 | 47 / 3 / 27.6 | 47 / 3 / 43.5 | 67 / 3 / 3.3 |
| [Publish-Subscribe](code/pattern_publish_subscribe/README.md) | Global Redis Event Publication and Streaming Subscription | 5 | 35 / 2 / 96.0 | 25 / 2 / 36.8 | 26 / 4 / 46.3 | 43 / 2 / 3.4 |
| [Asynchronous Message Queue / Job Queue](code/pattern_job_queue/README.md) | Federation Delivery Asynchronous Job Queue | 6 | 65 / 6 / 92.1 | 42 / 6 / 27.8 | 49 / 7 / 46.2 | 83 / 5 / 3.4 |
| [Front Controller](code/pattern_front_controller/README.md) | Misskey API Front Controller | 7 | 30 / 6 / 94.4 | 24 / 6 / 27.3 | 21 / 9 / 49.4 | 35 / 5 / 3.3 |
| [Router](code/pattern_router/README.md) | Nirax Frontend Router | 7 | 57 / 9 / 91.9 | 38 / 10 / 27.3 | 36 / 6 / 45.2 | 69 / 9 / 3.4 |
| [Service Layer](code/pattern_service_layer/README.md) | Misskey Core Application Service Layer | 8 | 78 / 6 / 104.2 | 61 / 5 / 55.3 | 54 / 5 / 46.5 | 92 / 6 / 3.5 |
| [Plugin Architecture / Microkernel](code/pattern_plugin_architecture/README.md) | Misskey Frontend Plugin Architecture | 7 | 27 / 3 / 79.0 | 16 / 4 / 25.0 | 19 / 2 / 46.3 | 35 / 3 / 3.7 |
| [Repository](code/pattern_repository/README.md) | Misskey Persistence Repository Layer | 6 | 52 / 3 / 92.3 | 40 / 4 / 23.9 | 40 / 3 / 51.0 | 58 / 6 / 3.5 |

## Limitations

- The fixtures show that the four snippets behave the same on these cases; they do not prove the snippets match Misskey beyond the cited ranges. Some rules in the models are not from Misskey (for example a fixed limit of two calls in the front controller) and are marked as such. The Observer snippets reproduce a quirk found in the source: the emitted `oldValue` equals the new value, and unchanged commits are not announced.
- LOC and complexity come from one tool. lizard 1.24.1 drops JavaScript methods named `get`, `set` or `delete` (the harness measures a temporary copy with those names suffixed by `_`; the files are unchanged) and reports bodiless declarations as no function, which cannot change a maximum. Radon agrees with lizard on 14 of 15 Python files (Router: 11 vs 10, because radon counts a loop `else`).
- All timings come from one machine without CPU pinning; the warm-up time was not stored.
- Of the 15 instances, 4 are in the Vue frontend (Proxy, Observer, Router, Plugin Architecture) and 11 in the NestJS backend.

## Report, slides and LLM records

- `A13_Part3_Report.pdf`: Part 3 report with the technology discussion and references.
- `llm/A13_slide.pdf`: 6-page slide deck following `llm/slide_outline.md`.
- LLM records: `data/llm.csv` (Part 3 rows also in `llm/llm.csv`); prompts and outputs in `llm/`; review entries in `llm/verification/human_review_checklist.md`. Part 3 was produced with Claude Sonnet 5.5; the prompt files are edited copies and the output files are extracts of the assistant text.
