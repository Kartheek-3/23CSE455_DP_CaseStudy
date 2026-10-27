# Team A8 — Design Patterns Case Study (23CSE455)

**Application:** NestJS Airline Reservation System  

**Original repository:** <https://github.com/zeyadAlbadawy/Airport-Reservation-System.git>  

**Team working repository (Part 2 evolution commits):** <https://github.com/DevBM04/DP_Case_study>  

**Baseline branch:** `main`  

**Baseline commit SHA:** `ae2c24869377ce2f7a29022cd237d808338156ea`  


This repository documents a design-pattern case study of a GraphQL-based airline reservation backend. It identifies the design patterns present in the original code, evolves the application through three feature changes while tracking how each pattern is affected, and re-implements selected patterns in four programming languages to compare them.

---

## Table of Contents

1. [Team Members](#1-team-members)
2. [Project Overview](#2-project-overview)
3. [Repository Structure](#3-repository-structure)
4. [Case Study Analysis](#4-case-study-analysis)
5. [Part 1 — Baseline Pattern Discovery](#5-part-1--baseline-pattern-discovery)
6. [Part 2 — Pattern Evolution](#6-part-2--pattern-evolution)
7. [Part 3 — Cross-Language Implementation](#7-part-3--cross-language-implementation)
8. [LLM Usage Records](#8-llm-usage-records)
9. [Reproducing the Results](#9-reproducing-the-results)
10. [Conventions](#10-conventions)

---

## 1. Team Members

| Roll Number | Name | Batch |
| :--- | :--- | :--- |
| AM.SC.U4CSE23016 | Balashankar Mohan | CSE-A |
| AM.SC.U4CSE23125 | Josewin Anto J | CSE-B |
| AM.SC.U4CSE23128 | Karthik Kishor | CSE-B |
| AM.SC.U4CSE23141 | Pavithra Nair | CSE-B |

---

## 2. Project Overview

The case study application is an airline reservation backend that exposes a GraphQL API. It covers:

- **User management:** registration, login, password reset, session-based authentication and Google OAuth.
- **Flight management:** creating, filtering, paginating and removing flights, plus assignment of staff.
- **Booking:** passengers book seats on flights and can cancel bookings.
- **Seat management:** seats are tied to a flight and a booking, with uniqueness and boundary validation.
- **Role-based access control:** three roles (`ADMIN`, `CREW`, `USER`) restrict who may call which operation.
- **Background processing:** email delivery (SendGrid and Mailtrap) is pushed to a queue and handled by a worker.

The baseline contains no payment entity, service, resolver or controller. Payment is therefore treated as an unimplemented capability, not as a pattern instance, and all three evolution changes deliberately exclude it.

### Technology stack

| Component | Version |
| :--- | :--- |
| Node.js | `v25.9.0` (baseline verification) |
| npm | `11.12.1` |
| TypeScript | `5.9.3` (`^5.7.3`) |
| NestJS Core | `^11.0.1` |
| NestJS GraphQL / Apollo | `^13.2.0` / `@apollo/server ^5.1.0` |
| TypeORM | `^0.3.27` |
| PostgreSQL driver (`pg`) | `^8.16.3` |
| DataLoader | `^2.2.3` |
| BullMQ | `^5.65.1` / `@nestjs/bullmq ^11.0.4` |
| Passport | `^0.7.0` / `passport-google-oauth20 ^2.0.0` |

### Deliverables at a glance

| Part | Scope | Outcome |
| :--- | :--- | :--- |
| Baseline | Build and test the unmodified application | Build passes, 10 unit tests pass, e2e fails (documented) |
| Part 1 | Pattern discovery in the baseline | 3 pattern types, 5 instances confirmed |
| Part 2 | Three feature changes, pattern tracking per change | All patterns preserved or extended; 14 → 21 → 27 tests passing |
| Part 3 | Cross-language re-implementation and benchmarking | 3 patterns × 4 languages, all tests passing |

---

## 3. Repository Structure

```text
A8/
├── README.md
├── A8_Report.pdf                      # final project report
├── A8_Report.tex                      # LaTeX source of the report
│
├── data/                              # BASELINE (unmodified original application)
│   ├── code/                          # original NestJS source at commit ae2c248
│   │   ├── src/
│   │   │   ├── app.module.ts          # root module: GraphQL, TypeORM, BullMQ, Mailer, Schedule
│   │   │   ├── main.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── schema.gql             # auto-generated GraphQL schema
│   │   │   ├── booking/               # BookingModule, service, resolver, DTOs, entity
│   │   │   ├── flight/                # FlightModule, service, resolver, guards/, loaders/
│   │   │   ├── seat/                  # SeatModule, service, resolver, loaders/, DTOs
│   │   │   └── users/                 # UsersModule, loaders/, workers/, guards/, google-auth/
│   │   └── test/                      # e2e test configuration
│   └── test_result/                   # real baseline build/test output
│       ├── README.md                  # commands, exit codes, analysis of the e2e failure
│       ├── environment.txt
│       ├── install_output.txt
│       ├── build_output.txt
│       ├── unit_test_output.txt
│       ├── e2e_test_output.txt
│       └── screenshots/               # build_result, unit_tests_pass, e2e_fail
│
├── Part1/                             # PATTERN DISCOVERY
│   ├── patterns.csv                   # confirmed pattern instances with participants and line ranges
│   ├── Pattern_count.csv              # per-pattern and total counts
│   ├── Part1_prompt.txt               # prompt given to the LLM
│   ├── part1_antigravity_output.md    # raw LLM output
│   ├── llm.csv                        # LLM usage and human evaluation
│   └── pattern_architecture/          # pattern_architecture.mmd + .png
│
├── Part2/                             # PATTERN EVOLUTION
│   ├── code/                          # evolved application (baseline + Change1..3)
│   ├── changes/
│   │   ├── Change1/                   # Flight Cancellation: requirement.md, diff.patch, test_result.txt
│   │   ├── Change2/                   # Seat-Class Expansion: requirement.md, diff.patch, test_result.txt
│   │   └── Change3/                   # Ticket Modification: requirement.md, diff.patch, test_result.txt
│   ├── diagrams/                      # domain_model_evolution.mmd, pattern_evolution.mmd
│   ├── llm/                           # per-change prompts, inputs and outputs
│   ├── pattern_evolution.csv          # every pattern instance at every version
│   ├── Pattern_count.csv              # counts per version
│   ├── Part2_prompt.text
│   ├── llm.csv
│   └── README_CONTRIBUTION.md         # source commits, environment, run/test commands, limitations
│
└── Part3/                             # CROSS-LANGUAGE IMPLEMENTATION
    ├── pattern_crosslanguage.csv      # the single Part 3 results file
    ├── dynamic_guard_factory/         # java/ python/ javascript/ cpp/
    ├── producer_consumer/             # java/ python/ javascript/ cpp/
    ├── batch_loader/                  # java/ python/ javascript/ cpp/
    └── llm/
        ├── part3_prompt.txt
        └── llm.csv
```

Each language folder under `Part3/` holds the implementation, a test program and `timing_raw.csv` with the raw timing runs. The Dynamic Guard Factory and Producer–Consumer folders also contain a per-language `README.md`.

---

## 4. Case Study Analysis

### 4.1 Architecture

The application follows the standard NestJS layered layout. Each domain (users, flights, bookings, seats) is a module made of the same building blocks:

| Layer | Responsibility | Examples |
| :--- | :--- | :--- |
| **Resolver** | Exposes GraphQL queries and mutations, applies guards, resolves relation fields | `BookingResolver`, `FlightResolver` |
| **Service** | Domain logic and persistence through TypeORM repositories | `BookingService`, `SeatService`, `FlightService` |
| **Entity** | TypeORM table mapping and GraphQL object type in one class | `User`, `Flight`, `Booking`, `Seat` |
| **DTO / Input** | Validated input and response shapes (`class-validator`) | `CreateSeatInput`, `UpdateBooking` |
| **Guard** | Authentication and authorization checks | `AuthGuard`, `AdminAuthGuard`, `rolesRestrict(...)` |
| **Loader** | Request-scoped batching of relation lookups | `UserDataLoader`, `FlightDataLoader`, `SeatDataLoader` |
| **Worker** | Background job consumer | `EmailProcessor` |

Cross-cutting infrastructure is configured in `app.module.ts`: Apollo GraphQL with a code-first schema, TypeORM for persistence, BullMQ on Redis for the `email` queue (2 attempts, 2 s backoff), `@nestjs-modules/mailer`, Passport sessions and `@nestjs/schedule` (used by `flight-auto-delete.service.ts` to remove expired flights).

### 4.2 Domain model

```
User ──< Booking >── Flight
            │
            └──< Seat >── Flight
```

A `Booking` links a `User` to a `Flight` and owns one or more `Seat` records. Tickets are modelled by the `Booking` aggregate itself, so no separate `Ticket` entity exists.

### 4.3 Representative request flow

1. A GraphQL mutation (for example `createBooking`) reaches `BookingResolver`.
2. A guard built by `rolesRestrict('USER')` checks the session user's role.
3. The resolver delegates to `BookingService` and `SeatService`, which persist through TypeORM.
4. When the response selects `user`, `flight` or `seat`, the resolver calls the request-scoped DataLoaders so that all lookups for the same field are merged into one SQL query.
5. A notification is handed to `SendGridService`, which enqueues a job on the BullMQ `email` queue.
6. `EmailProcessor` consumes the job asynchronously and sends the email.

### 4.4 Pattern analysis

Five independent pattern instances of three pattern types were confirmed in the baseline.

#### Dynamic Guard Factory — *Creational*

| | |
| :--- | :--- |
| **Instance** | Role-Based Guard Synthesis |
| **Location** | `src/flight/guards/roles.restrict.guard.ts:12-28` |
| **Participants** | Factory function `rolesRestrict`, product class `RolesRestriceGuard`, product interface `CanActivate`, dependency `UsersService` |
| **How it works** | `rolesRestrict(...allowedRoles)` closes over the allowed roles, declares a guard class inside the function and returns it through NestJS `mixin()`. Each call therefore produces a distinct, injectable guard class. |
| **Problem solved** | Avoids writing one guard class per role combination across the GraphQL resolvers. |
| **Trade-off** | The guard class is created at decoration time, so it is hard to unit test in isolation and depends on framework `mixin()` support. |

#### Batch Loader — *Architectural* (three instances)

| Instance | Provider | Location | Resolver field |
| :--- | :--- | :--- | :--- |
| User Entity Batch Loading | `UserDataLoader` | `src/users/loaders/user.loader.ts:10-24` | `BookingResolver.user` |
| Flight Entity Batch Loading | `FlightDataLoader` | `src/flight/loaders/flight.loader.ts:7-23` | `BookingResolver.flight` |
| Seat Entity Batch Loading | `SeatDataLoader` | `src/seat/loaders/seat.loader.ts:8-45` | `BookingResolver.seat` |

All three are `Scope.REQUEST` providers that wrap a `DataLoader`. IDs requested during one resolution tick are collected and fetched with a single `WHERE id IN (...)` query (TypeORM `In()`), then re-ordered to match the input keys. This removes the GraphQL N+1 query cascade when a list of bookings is resolved. `SeatDataLoader` additionally exposes a second loader (`seatManyLoader`) for booking-to-seat relations.

#### Producer–Consumer — *Architectural*

| | |
| :--- | :--- |
| **Instance** | Async Email Processing Queue |
| **Location** | `send-grid.service.ts:30-42`, `users.resolver.ts`, `app.module.ts`, `workers/email.worker.ts:8-25` |
| **Participants** | Producers `SendGridService` and `UsersResolver`; channel BullMQ queue `email`; consumer `EmailProcessor` |
| **How it works** | Producers enqueue `sending-token-sendGrid` and `sending-token-mailtrap` jobs. `EmailProcessor.process()` dispatches on `job.name` and sends the email in the background. |
| **Problem solved** | Keeps slow, I/O-heavy email delivery out of the synchronous API request path and adds retry and backoff for free. |
| **Trade-off** | Adds a Redis dependency and eventual consistency: a request can succeed even though the email later fails. |

#### Candidates rejected

`allAuthGuard` was examined as a possible Composite pattern and rejected during verification. Framework internals (Passport's Google strategy, TypeORM's standard repository mechanics) were also excluded because they are framework collaborations, not application-level pattern instances.

### 4.5 Baseline quality findings

- Build succeeds and all 10 unit tests pass.
- The e2e suite fails before any test runs: `test/jest-e2e.json` has no `moduleNameMapper`, so absolute `src/...` imports cannot be resolved. This is a configuration defect in the original project. The source was intentionally left untouched, and the failure is recorded as observed.
- The pattern code mixes concerns in places, for example `console.log` of the user ID inside the guard and logging inside the worker. These are noted as observations only; the baseline was not refactored.

---

## 5. Part 1 — Baseline Pattern Discovery

**Goal:** identify and verify design-pattern instances in the unmodified baseline.

**Method:** an LLM analysed the repository with the prompt in `Part1/Part1_prompt.txt`. Every candidate was then checked by hand against the source, and each accepted instance is recorded with its participants and exact line ranges.

**Result**

| Pattern | Type | Instances |
| :--- | :--- | ---: |
| Dynamic Guard Factory | Creational | 1 |
| Batch Loader | Architectural | 3 |
| Producer–Consumer | Architectural | 1 |
| **Total** | **3 types** | **5 instances** |

**Artifacts:** `patterns.csv`, `Pattern_count.csv`, `pattern_architecture/` (Mermaid source and rendered PNG), `llm.csv`.

### Baseline test evidence (`data/test_result/`)

All commands were run against the unmodified source in `data/code/` on macOS with Node.js v24.15.0 and Jest 30.1.3.

| Command | Exit code | Result |
| :--- | ---: | :--- |
| `npm ci` | 0 | Dependencies installed (npm reported warnings and 147 vulnerabilities) |
| `npm run build` | 0 | Build succeeded |
| `npm test` | 0 | 10 suites passed, 10 tests passed |
| `npm run test:e2e` | 1 | Failed: `Cannot find module 'src/flight/entities/flight.entity'`. Zero tests executed |

The e2e failure cause is described in section 4.5. Raw output and screenshots are stored next to a detailed `README.md` in `data/test_result/`.

---

## 6. Part 2 — Pattern Evolution

**Goal:** apply three realistic feature changes to the baseline and record what happens to each pattern. Source for each change is in `Part2/code/`; each change folder holds its requirement, its diff and its test output.

### Change 1 — Flight Cancellation

Replaces destructive flight removal with a lifecycle state.

- `Flight` gains `status: FlightStatus` (`ACTIVE | CANCELLED`); cancelling sets the status and `availableSeats = 0` instead of deleting the row.
- Booking a cancelled flight is rejected.
- All seats of the flight are released.
- New `cancelFlight` mutation guarded by `rolesRestrict(Role.ADMIN, Role.CREW)`; `removeFlight` stays backward compatible and delegates to it.
- Affected passengers are notified through the existing email queue.

### Change 2 — Seat-Class Expansion

Moves from uniform seating to cabin classes.

- New `SeatClass` enum (`FIRST | BUSINESS | ECONOMY`) on the `Seat` entity and `CreateSeatInput`.
- Row rules: rows 1–3 FIRST, 4–8 BUSINESS, 9–20 ECONOMY.
- An explicit class must match the row range; an omitted class is inferred from the row.
- `BookingResolver.createBooking` forwards `seatClass` to `SeatService.createSeat`.

### Change 3 — Ticket Modification

Lets passengers change an existing booking.

- `UpdateBooking` input carries `bookingId`, optional `flightId` and optional `seats`.
- New `modifyBooking` mutation (and backward-compatible `updateBooking`), both guarded by `rolesRestrict('USER')`.
- Ownership is verified; modifying a booking on a cancelled flight, or transferring to one, is rejected.
- Flight transfers restore capacity on the old flight and consume it on the new one.
- New seats are allocated through `SeatService.createSeat`, so class and collision validation is reused.

### Pattern outcome per change

| Pattern instance | Change 1 | Change 2 | Change 3 |
| :--- | :--- | :--- | :--- |
| Dynamic Guard Factory | **Extended** — guards `cancelFlight` | Preserved | **Extended** — guards `modifyBooking` / `updateBooking` |
| User Batch Loader | Preserved | Preserved | Preserved |
| Flight Batch Loader | Preserved | Preserved | Preserved |
| Seat Batch Loader | Preserved | Preserved — resolves seats with `seatClass` | Preserved |
| Producer–Consumer | **Extended** — `FlightService` becomes a producer | Preserved | Preserved |

Pattern counts stay at **3 types and 5 instances** in every version. The evolution reused the existing patterns rather than adding new ones, and the batch loaders absorbed new entity fields (`status`, `seatClass`) with no change to their own code. The guard factory and email queue were the two extension points, each gaining new callers without any change to their implementation.

### Test results

| Version | Suites | Tests passed |
| :--- | ---: | ---: |
| Baseline | 10 | 10 |
| After Change 1 | 10 | 14 |
| After Change 2 | 10 | 21 |
| After Change 3 | 10 | 27 |

**Source commits:** baseline `ae2c248…`, Change 1 `b731f57`, Change 2 `febb4c4`, Change 3 `34e8621`. See `Part2/README_CONTRIBUTION.md` for environment versions, run commands and limitations.

**Known limitation:** modifying a seat requires sending the complete target seat list; the new `seats` array replaces the old one entirely.

**Artifacts:** `pattern_evolution.csv`, `Pattern_count.csv`, `diagrams/`, `changes/`, `llm/`, `llm.csv`.

---

## 7. Part 3 — Cross-Language Implementation

Three confirmed patterns were reduced to standalone, framework-free implementations in **Java, Python, JavaScript and C++**. Each language uses the same inputs and the same expected outputs.

### 7.1 Patterns implemented

**Dynamic Guard Factory — Role-Based Guard Synthesis**
Source: `data/code/src/flight/guards/roles.restrict.guard.ts`. A factory takes a list of allowed roles and returns a guard that decides whether a user role is authorized. NestJS decorators, sessions, GraphQL context and `UsersService` were removed. The rules are: a role in the list gives `true`; a role not in the list, an empty list or a missing role gives `false`.

**Producer–Consumer — Async Email Processing Queue**
Sources: `send-grid.service.ts`, `users.resolver.ts`, `workers/email.worker.ts`. Producers enqueue email jobs into a deterministic FIFO queue and a consumer processes them by job type (`SENDGRID`, `MAILTRAP`). Redis, BullMQ, network calls and credentials were removed; no email is actually sent.

**Batch Loader — User Entity Batch Loading**
Source: `data/code/src/users/loaders/user.loader.ts`. A `BatchLoader` collects keys requested by `load()`, de-duplicates them through a cache and resolves all pending keys with one batch function call on `dispatch()`. A simulated user repository counts its queries to prove that batching occurs.

### 7.2 Results

All test programs report a full pass, and every timing figure comes from real execution.

| Pattern | Language | Tests | Source LOC | Max function CC | Median time (ms) |
| :--- | :--- | ---: | ---: | ---: | ---: |
| Dynamic Guard Factory | Java | 7/7 | 19 | 2 | 78.37 |
| Dynamic Guard Factory | Python | 7/7 | 9 | 2 | 34.35 |
| Dynamic Guard Factory | JavaScript | 7/7 | 12 | 2 | 41.54 |
| Dynamic Guard Factory | C++ | 7/7 | 18 | 2 | 7.63 |
| Producer–Consumer | Java | 4/4 | 51 | 4 | 94.44 |
| Producer–Consumer | Python | 4/4 | 24 | 4 | 62.50 |
| Producer–Consumer | JavaScript | 4/4 | 38 | 4 | 51.81 |
| Producer–Consumer | C++ | 4/4 | 38 | 4 | 10.85 |
| Batch Loader | Java | 7/7 | 71 | 3 | 91.63 |
| Batch Loader | Python | 7/7 | 32 | 3 | 23.83 |
| Batch Loader | JavaScript | 7/7 | 48 | 2 | 41.28 |
| Batch Loader | C++ | 7/7 | 79 | 5 | 11.28 |

LOC counts represent nonblank production-source lines, excluding separate test files and comment-only lines. Maximum function cyclomatic complexity (CC) is calculated as 1 plus the number of decision points in a function. Timing includes process startup and test execution but excludes compilation.

### 7.3 Observations

- **Code size:** Python is the most compact in both measured patterns (9 and 24 lines). Java is the most verbose (19 and 51) because of explicit classes, interfaces and generics.
- **Complexity:** the logic is identical across languages, so maximum cyclomatic complexity is the same (2 for the guard, 4 for the queue). The patterns do not depend on the language.
- **Runtime:** C++ is fastest (about 8–11 ms) because it is a native executable with no runtime to start. Java is the slowest (about 78–94 ms) because the figure includes JVM startup and class loading. Python and Node.js fall in between. These timings are dominated by process startup, since the workloads are tiny; they say more about each runtime's start-up cost than about the pattern.
- **Idiom:** the guard factory maps naturally onto closures in Python and JavaScript, while Java and C++ express the same idea with a class or lambda that captures the role set.

### 7.4 Measurement rules

- **LOC:** production lines only; blank lines, comments and tests are excluded.
- **Cyclomatic complexity:** the maximum value over the functions of the implementation.
- **Timing:** compile first, then one warm-up run and five measured runs on the same machine; the median is reported.
- **Timing scope:** process start-up plus test execution; compilation is excluded. Raw runs are stored in each language folder's `timing_raw.csv`.
- No timing value was estimated and no compiled binary is stored in the repository.

### 7.5 Runtime environment

| Language | Runtime / compiler |
| :--- | :--- |
| Java | Java 25.0.1 LTS / `javac` 25.0.1 |
| Python | Python 3.11.9 |
| JavaScript | Node.js v22.12.0 |
| C++ | g++ (MSYS2) 14.2.0, C++17 |

### 7.6 Results file

`Part3/pattern_crosslanguage.csv` is the single results file. Columns: `pattern_name`, `instance_name`, `language`, `snippet_path`, `source_loc`, `max_function_cc`, `runtime_compiler`, `test_command`, `test_result`, `median_process_ms`, `language_notes`.

---

## 8. LLM Usage Records

LLM use is documented per part in an `llm.csv` file with the model, date, prompt, input, output, evaluation and the file that verifies the result.

| Part | Model | Records | Verification |
| :--- | :--- | :--- | :--- |
| Part 1 | Gemini 3.6 Flash (High), Oct 2026 | `Part1/llm.csv`, `Part1_prompt.txt`, `part1_antigravity_output.md` | Manual check of every candidate against source; results in `patterns.csv` |
| Part 2 | Gemini 1.5 Pro, 2026-10-06 | `Part2/llm.csv`, `Part2/llm/` (prompts, inputs, outputs) | Source inspection and `npm test` per change |
| Part 3 | GPT-5.6 Luna, 2026-10-06 | `Part3/llm/llm.csv`, `part3_prompt.txt` | Language test programs and raw timing files |

Where a literal model transcript could not be recovered (Part 2 Change 2 output, Part 3 output), `llm.csv` says so and states how the result was verified independently instead. Part 2 Change 3 records are marked as reconstructed. No transcript is claimed that does not exist.

---

## 9. Reproducing the Results

### Baseline application (`data/code/`)

```bash
cd data/code
npm ci
npm run build        # succeeds
npm test             # 10 suites, 10 tests pass
npm run test:e2e     # fails: moduleNameMapper missing (documented baseline defect)
```

Running the full application additionally needs PostgreSQL, Redis (BullMQ at `localhost:6379`) and the environment variables listed in `.env.example`. No secrets are committed.

### Evolved application (`Part2/code/`)

```bash
cd Part2/code
npm ci
npm run build
npm test             # 10 suites, 27 tests pass
```

### Cross-language tests (`Part3/`)

Run each command from the language folder of the pattern.

| Language | Dynamic Guard Factory | Producer–Consumer | Batch Loader |
| :--- | :--- | :--- | :--- |
| Java | `javac *.java && java RoleGuardFactoryTest` | `javac *.java && java ProducerConsumerTest` | `javac *.java && java BatchLoaderTest` |
| Python | `python test_role_guard_factory.py` | `python test_producer_consumer.py` | `python test_batch_loader.py` |
| JavaScript | `node testRoleGuardFactory.js` | `node testProducerConsumer.js` | `node testBatchLoader.js` |
| C++ | `g++ -std=c++17 -O2 test_role_guard_factory.cpp -o test_role_guard_factory` then run it | `g++ -std=c++17 -O2 test_producer_consumer.cpp -o test_producer_consumer` then run it | `g++ -std=c++17 -O2 test_batch_loader.cpp -o batch_loader_test` then run it |

---

## 10. Conventions

- **The baseline is frozen.** `data/code/` is the original application and is never edited. Evolved code lives only in `Part2/code/`, and the reduced implementations in `Part3/` are standalone, not replacements for either.
- **Evidence is real.** Test output, timings and LLM records come from work that was actually executed; failures are recorded, not hidden.
- **One Part 3 CSV.** `Part3/pattern_crosslanguage.csv` is the only cross-language results file.
- **Repository hygiene.** No compiled binaries, dependency caches, `.env` files or secrets are committed.
