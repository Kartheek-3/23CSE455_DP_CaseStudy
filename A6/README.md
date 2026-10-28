# A6 - Ride-Sharing Application using Node.js/Express

Case study: **Design Pattern Analysis in a Node.js/Express Ride-Sharing Application** (23CSE455 Design Patterns)

## Team

| Roll number | Student name | Batch | Main area |
|---|---|---|---|
| AM.SC.U4CSE23137 | Dilip Kumar Reddy | CSE B | Lead: application study, architecture, Part 1, integration, report |
| AM.SC.U4CSE23326 | Sai Sameer | CSE D | CH01 new driver status, Part 3 Observer |
| AM.SC.U4CSE23134 | M Kumar | CSE B | CH02 ride cancellation, Part 3 State |
| AM.SC.U4CSE23129 | K Harish | CSE B | CH03 ride types + dynamic pricing, Part 3 Strategy |
| AM.SC.U4CSE23154 | S Leela Shankar | CSE B | UML diagrams, Part 3 measurements, dataset audit, slides |

Detailed allocation and evidence paths: `data/contributions.csv`. Sign-off sheet: `HUMAN_VERIFICATION.md`.

## Selected application

- **Sarathi backend** - open-source driver-hire / ride-sharing API by AkhilMM2000.
- Upstream URL: https://github.com/AkhilMM2000/sarathi-backend
- Baseline commit: `c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a` (2026-06-16, 185 commits on the default branch). Accessed 2026-10-11.
- License: **none** - the repository has no LICENSE file and `package.json` says `"license": "ISC"`. The code is studied
  here for academic analysis only; this is recorded as a limitation.
- Faculty approval: confirmed by the course instructor (reported by the team lead, 2026-10-11).
- Stack: TypeScript 5 on Node.js, Express 4.22, Mongoose 8.24 (MongoDB Atlas), tsyringe 4.10 (IoC container),
  Socket.IO 4.8, Upstash Redis, Stripe 18.5, Google Distance Matrix API, Zod 4. Versions are those resolved by
  `npm install` on 2026-10-11 (the upstream repo ignores `package-lock.json`).

`Part1/code` is the baseline exactly as published except: `dist/` (committed compiled output), three PNG screenshots and
`tmp.txt` (a compiler log) were left out, and the demo e-mail/passwords in `README.md` were replaced by `[redacted-...]`.
`Part2/code` is the evolved source after CH01-CH03 plus the test suite.

## Source versions

| Snapshot | Commit (local evolution branch `a6-evolution`) | Evidence |
|---|---|---|
| Original code | `c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a` (upstream) | `Part1/code`, `Part1/evidence/source_manifest.sha256` |
| Test harness only | `168ef00003dfcba41e9939c1f4887e125ed79638` | `Part1/evidence/test_harness.patch` (tests + npm script, no `src` change) |
| After CH01 | `f6353555bedbe0a9bcd083b4967ce7699498c027` | `Part2/changes/CH01/new_driver_status.patch` |
| After CH02 | `28a83c8776feff6acc2727c48306ffae825a2f7f` | `Part2/changes/CH02/ride_cancellation.patch` |
| After CH03 (final) | `a12c878a4977787b8d2c5349dfebd7b3f605824c` | `Part2/code`, `Part2/changes/CH03/ride_types_dynamic_pricing.patch` |

Applying the three patches in order to the harness commit reproduces `src/`, `tests/` and `package.json` of `Part2/code`. Line ranges in
`data/patterns_evolution.csv` for evolved rows refer to `Part2/code` (final snapshot); rows whose status is `preserved`
drop line ranges inside files that the changes edited, because those lines moved.

## Inspected modules (scope)

The seven areas named in the case study: **rider** (`User`, `MongoUserRepository`), **driver** (`Driver`,
`MongoDriverRepository`, driver reviews), **trip** (`Booking`, `BookDriver`, `AcceptBooking`, `CancelBooking`,
`UpdateBookingStatus`, `CronScheduler`), **payment** (`PaymentService`, Stripe Connect `StripeService`, wallet),
**driver matching** (`BookDriver`, `FindNearbyDrivers`, `$geoNear` query), **location** (`GoogleDistanceService`,
`GoogleMapService`), **notification** (`SocketNotificationService`, Socket.IO handlers, Redis registry), plus the cross-cutting
framework code they rely on (DI container, middleware, error handling).
Excluded: chat, vehicle management, file upload (Cloudinary), referral rewards, OTP/registration/Google OAuth/password reset,
admin dashboards - outside the seven areas.

## Results summary

| Snapshot | Pattern types | Pattern instances | New / changed |
|---|---:|---:|---|
| Original code | 10 | 16 | Layered Architecture, DI, Singleton, Repository x5, Data Mapper, Adapter x3, Gateway, Observer, Chain of Responsibility, Decorator |
| After CH01 | 11 | 17 | + State (Driver Account Lifecycle) |
| After CH02 | 12 | 19 | + State (Trip Lifecycle and Cancellation), + Strategy (Cancellation Fee Policy) |
| After CH03 | 12 | 21 | + Strategy (Ride Fare Pricing), + Decorator (Dynamic Fare Pricing) |

Rejected baseline candidates: Strategy, State, Command, Template Method, Factory Method, Facade. Uncertain: Google Maps adapter
and Twilio SMS adapter (implemented and registered but no client uses them).

Tests: baseline characterization suite 14/14; after CH01 22/22; after CH02 33/33; after CH03 41/41. `tsc --noEmit` reports
the same 7 pre-existing errors at every snapshot (dependency-version drift, none in changed code).
Part 3: Strategy 8/8, State 8/8, Observer 6/6 in Java, Python, JavaScript and C++.

## Environment

| Tool | Version |
|---|---|
| OS | Windows 11 Home 10.0.26300 (C++ runs in Docker Desktop 29.5.2, Linux container) |
| Node.js / npm | v22.18.0 / 11.7.0 |
| TypeScript / ts-node | 5.9.3 / 10.9.2 |
| Java | Oracle Java 25 (javac 25) |
| Python | 3.13.7 |
| C++ | g++ 13.5.0 in `gcc:13` Docker image, `-std=c++20 -O2` |
| Metrics | lizard 1.17.13 (Java/Python/JS/C++), `tools/ts_metrics.js` (TypeScript) |
| Diagrams | PlantUML 1.2024.7 (`plantuml/plantuml` Docker image) |

## Run and test commands

```bash
# Part 1 / Part 2 - application tests (no MongoDB/Redis/Stripe/Google keys needed; all external services are faked)
cd Part2/code
npm install
npm test                      # 41/41
npx tsc --noEmit -p .         # 7 pre-existing errors, same as baseline

# Baseline characterization run: apply the harness patch to a copy of Part1/code, then npm install && npm test (14/14)

# Part 3 - compile, test, time and measure all 12 snippets (from the A6 folder)
pip install lizard==1.17.13
python tools/run_part3.py --lizard <path-to-lizard> --build <scratch-dir>

# Dataset CSVs and diagrams
python tools/build_dataset.py
docker run --rm -v "$PWD/Part1/diagrams:/data" plantuml/plantuml:1.2024.7 -tpng "/data/*.puml"
```

Each Part 3 language folder has its own README with the single-snippet command.

## Measurement rules

- **Pattern counting:** one independently collaborating set of participants is one instance; several concrete classes in
  one collaboration count once. Removed instances would be excluded from a snapshot's totals (none were removed).
- **Source LOC:** non-blank, non-comment lines of production files only (tests excluded). Java/Python/JS/C++: lizard file
  NLOC. TypeScript: `tools/ts_metrics.js` (lizard 1.17.13 does not detect functions inside decorated TypeScript classes).
- **Cyclomatic complexity:** per function, 1 + decision points (if, loops, case, catch, ?:, &&, ||, ??); the maximum per file
  is reported. lizard applies the same rule to the other four languages.
- **Timing:** compile first (not timed), 1 warm-up run, then 5 measured runs of the complete test process; the median is
  reported. Time includes process start-up and running all fixtures; it excludes compilation. Java/Python/JS are timed on the
  Windows host with `time.perf_counter`; C++ is timed inside the container with `date +%s%N`, so container start-up is excluded.
  Raw runs: `Part3/evidence/cross_language_runs.txt`.

## Limitations

- The full server was not started against live MongoDB/Redis/Stripe/Google services (no credentials). Use cases were tested
  through their real classes with in-memory fakes of the repositories, notifier and distance gateway.
- Upstream ignores `package-lock.json`; today's dependency versions produce 7 type errors in untouched files.
- Observer participants on the client side (rider/driver apps) are outside this repository.
- Upstream has no LICENSE file.
- C++ timings are from a Linux container and are not directly comparable with host timings; they show order of magnitude only.
- LLM records: 10 real runs (1 Claude Code, 9 ChatGPT free tier). The ChatGPT runs were made from the team lead's computer with the browser
  driven by Claude Code because members were unavailable; the member named on each file is the topic owner (see `prompts/README.md`).
- Cancellation is read-then-update (not one atomic conditional update) and acceptance does not re-check `activePayment`; both were
  raised by the ChatGPT reviews and are left as future work.

## Folder map

```text
A6/
  README.md, HUMAN_VERIFICATION.md, A6_Report.tex, A6_Report.pdf
  data/        patterns.csv, pattern_counts.csv, patterns_evolution.csv, cross_language.csv, llm.csv, contributions.csv
  Part1/       code/ (baseline), diagrams/, evidence/
  Part2/       code/ (evolved + tests), changes/CH01..CH03/ (requirement, patch, test result), diagrams/, evidence/
  Part3/       <pattern>/{java,python,javascript,cpp}/, test-cases/ (specs), evidence/, A6_slide.pdf
  prompts/     LLM prompts, raw outputs, verification notes
  tools/       dataset builder, metrics and Part 3 runner
```

## References

- Upstream application: https://github.com/AkhilMM2000/sarathi-backend
- E. Gamma, R. Helm, R. Johnson, J. Vlissides, *Design Patterns*, Addison-Wesley, 1994.
- M. Fowler, *Patterns of Enterprise Application Architecture*, Addison-Wesley, 2002 (Repository, Data Mapper, Gateway).
- Express 4 middleware: https://expressjs.com/en/guide/using-middleware.html
- tsyringe: https://github.com/microsoft/tsyringe ; Socket.IO: https://socket.io/docs/v4/
