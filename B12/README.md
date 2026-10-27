# 23CSE455 Design Pattern Case Study — Team B12

## Team

Team: B12

## Case Study

Design Pattern Identification and Evolution in a NestJS-Based Parking Management Application

## Students

1. Samanthula Eswar — AM.SC.U4CSE23349 — CSE
2. Bantupalli Harsha Vardhan — AM.SC.U4CSE23210 — CSE
3. Rayudu Vamsi Krishna — AM.SC.U4CSE23344 — CSE
4. Sammeta Pavan — AM.SC.U4CSE23350 — CSE

## Application

Application: Smart Parking Reservation System (NestJS backend + Next.js frontend)
Status: Part 1 baseline analysed (commit 940daee)

## Original Source

Repository URL: https://github.com/nuhu78/Smart-Parking-Reservation-System.git
Version/Tag: main (no release tags)
Baseline Commit: 940daeeab52d5a0b101ce0e76813bcfac88e01a1
Access Date: 2026-10-10
License: UNLICENSED (smart-parking-backend/package.json:7); no LICENSE file present

## Environment

Language: TypeScript (backend); JavaScript/JSX (frontend)
Framework: NestJS ^11.0.1 (backend); Next.js 16.2.6 with React 19.2.4 (frontend)
Database: PostgreSQL via TypeORM ^0.3.28 (synchronize: true)
Dependency Versions: @nestjs/jwt ^11.0.2; @nestjs/passport ^11.0.5; passport ^0.7.0; passport-jwt ^4.0.1; @nestjs-modules/mailer ^2.3.4; nodemailer ^8.0.7; handlebars ^4.7.9; class-validator ^0.15.1; class-transformer ^0.5.1; bcryptjs ^3.0.3; pg ^8.20.0

## Scope

Modules to be inspected:

- Parking-slot management
- Vehicle management
- Reservation
- Payment
- Occupancy
- EV charging
- Notifications

Baseline status (commit 940daee): parking-slot management, reservation and
notifications are CONFIRMED; vehicle management, payment, occupancy and EV
charging are NOT FOUND as modules. Details in
`Part1/report/B12_Part1_Pattern_Discovery.md`.

## Part 1

Baseline pattern discovery is complete for commit 940daee. See:

- `Part1/report/B12_Part1_Pattern_Discovery.md` — discovery report
- `Part1/evidence/pattern_evidence.md` — confirmed-pattern evidence
- `Part1/evidence/rejected_and_uncertain.md` — rejected / uncertain candidates
- `Part1/diagrams/` — UML sources (module, class, sequence)
- `data/patterns.csv`, `data/pattern_counts.csv` — inventory and counts

## Part 2

Three evolution changes, implemented as additive overlays (the baseline was not
modified in place), each with a sequential diff, tests and a requirement note:

1. Dynamic parking-slot allocation — **Strategy** — `Change1/` (8/8 tests pass)
2. EV charging — **State** — `Change2/` (8/8 tests pass)
3. Real-time occupancy monitoring — **Observer** — `Change3/` (5/5 tests pass)

Code: `Part2/code/evolved/` (apply over the baseline; see `Part2/code/README.md`).
Diffs: `Part2/changes/ChangeN/diff/`. Evidence and summary: `test_result/`.

## Part 3

Cross-language comparison of all six confirmed pattern types — **Strategy** (slot
allocation), **State** (EV charging), **Observer** (slot occupancy), **Repository**
(user accounts), **Dependency Injection** (notification channels) and **Layered
Architecture** (reservation handling) — in JavaScript, Python, Java and C++. All
24 suites pass (one per pattern per language). Snippets under
`Part3/<Pattern>/<lang>/`; raw run logs in `Part3/evidence/`; metrics in
`data/cross_language.csv`.

Part 3 scope was resolved in favour of the literal instruction "for each detected
pattern type"; the decision is recorded in `Part3/Part3_scope_decision_note.md`.

## LLM Usage

Four LLM artifacts are recorded (the members' shared ChatGPT research
conversations, treated as research artifacts only and not as evidence). No LLM
was used to produce the Part 2/Part 3 code, tests or metrics, and no new prompt
was issued for Part 2. Records: `data/llm.csv`, `LLM_RESEARCH_REFERENCES.md`,
`CONTRIBUTIONS.md`, `Part1/prompts/`, `Part2/prompts/`, `Part3/prompts/`.

## Contributions

Parts 1-3, testing, metrics and CSV validation were collaborative efforts of all
four members; Eswar led final report preparation, integration and submission (team
declaration). The declared work division, each member's ChatGPT research
conversation and the evidence references are recorded in `CONTRIBUTIONS.md` (also
summarised in `B12_Report.tex`).

## Metrics

- `data/patterns.csv` — 7 baseline pattern instances
- `data/patterns_evolution.csv` — per-version instance evolution (status per change)
- `data/pattern_counts.csv` — pattern counts per version (baseline + Part 2)
- `data/cross_language.csv` — LOC, max cyclomatic complexity and median process
  time per pattern per language
- Measurement rules: `Part3/evidence/README.md`

## Reproducibility

- Baseline source commit: `940daeeab52d5a0b101ce0e76813bcfac88e01a1`
- Environment: Node v24.18.0 / npm 11.5.2, Jest 30.2.0; Python 3.13.7;
  javac/java 17.0.18; g++ (MinGW-W64 UCRT) 16.2.0; tectonic 0.17.0
- Part 2 test command: `npx jest --runInBand --testPathPatterns "<pattern>"`
  (run from a copy of the backend with dependencies installed)
- Part 3: per language `test_strategy.*` / `test_state.*` (commands in
  `Part3/evidence/*.txt`)
- LOC / complexity / timing rules: `Part3/evidence/README.md`

## Limitations

See the Limitations section of `B12_Report.tex`. In brief: the baseline backend
has no committed `node_modules` and an out-of-sync lockfile (tests run via
`npm install` in a disposable copy); three baseline `auth`/`mail` spec suites
fail identically on the untouched baseline (raw log:
`test_result/baseline_preexisting_failures_raw.txt`) and are unrelated to
Part 2. Rendered diagram images are committed under `Part1/diagrams/rendered/`
and `Part2/diagrams/rendered/` alongside the editable `.puml` sources.
