# Team A1 — 23CSE455 Design Patterns Case Study

**Case study:** food delivery application built with Django
**Application:** [HarshavardhanVemali/campus-food-ordering](https://github.com/HarshavardhanVemali/campus-food-ordering) (MIT licence), approved by the course faculty for Team A1
**Report:** [`A1_Report.pdf`](A1_Report.pdf) (LaTeX source [`A1_Report.tex`](A1_Report.tex)) · **Slides:** [`Part3/llm/A1_slide.pdf`](Part3/llm/A1_slide.pdf) · **Prepared:** 2026-10-11

| Roll number | Name | Batch | Contribution area |
|---|---|---|---|
| AM.SC.U4CSE23001 | Aadil Nizar | CSE A | Refactoring and CH01 implementation |
| AM.SC.U4CSE23007 | Adil Najeem | CSE A | Baseline analysis |
| AM.SC.U4CSE23014 | Athul Yesudas | CSE A | Pattern discovery |
| AM.SC.U4CSE23039 | Hima C | CSE A | Testing and validation |
| AM.SC.U4CSE23046 | M Krishnapriya | CSE A | Cross-language comparison |
| AM.SC.U4CSE23053 | Muhammed Faais A | CSE A | Report and repository preparation |

## Contents

| Part | Content |
|---|---|
| Part 1: pattern discovery | 1 pattern type (Observer), 2 instances, 12 rejected and 2 uncertain candidates; evidence, scan script, diagrams. |
| Part 2: evolution | CH01, interchangeable delivery-assignment policies (new Strategy): diff, source before and after, tests, logs, metrics. CH02 and CH03 were not implemented; their folders hold status notes. |
| Part 3: cross-language | The team's Java, Python, JavaScript and C++ Observer + Strategy programs, with a shared fixture, test runners, logs, LOC/complexity and timing. |

## Application and source versions

- Baseline commit: `83998629e633594037cfa25e583542f9f6f0f968` (no tag). The archive URL and SHA-256 are in [`data/provenance/provenance.json`](data/provenance/provenance.json), and per-file hashes for all 170 upstream files are in [`data/provenance/baseline-files.sha256.json`](data/provenance/baseline-files.sha256.json).
- Baseline source: [`data/code/baseline_83998629/`](data/code/baseline_83998629/). Of the 170 upstream files, 167 are byte-identical, 2 carry one-line credential redactions ([`REDACTIONS.md`](data/provenance/REDACTIONS.md)), and 1 stock video (15 MB, not source code) is omitted to keep the ZIP under the 30 MB transfer limit. Check with `python3 data/code/verify_baseline.py`.
- After CH01: [`data/code/evolved_CH01/`](data/code/evolved_CH01/). CH01 has no Git commit; it is the baseline plus [`Part2/changes/Change1/CH01.diff`](Part2/changes/Change1/CH01.diff). Applying the diff to a fresh baseline copy reproduces the four changed files byte for byte ([`RECHECKS.md`](Part2/changes/Change1/rerun_2026-10-11/RECHECKS.md)). The evolved copy omits unchanged media; [`data/code/README.md`](data/code/README.md) gives the restore command.

## Environment versions

| Purpose | Versions | Evidence |
|---|---|---|
| Application pins | Django 6.0.4, channels 4.3.2, daphne 4.2.1, django-allauth 65.16.1, firebase-admin 7.4.0, phonepe-sdk 1.1.0 (99 pins) | `data/code/baseline_83998629/requirements.txt` |
| CH01 validation | Python 3.12.14, Django 6.0.4, Channels 4.3.2, SQLite 3.53.1, `InMemoryChannelLayer` | `Part2/changes/Change1/evidence/runtime-versions.txt`, `environment-freeze.txt` |
| Part 3 | OpenJDK 21.0.12.1, CPython 3.13.16, Node.js 22.22.0, g++ 13.3.0, lizard 1.24.1, Linux 6.18 x86_64 | `Part3/evidence/toolchain_versions.txt` |

The upstream README mentions Django 5.1 and Redis. This work follows the pinned requirements and `canteen/settings.py` (in-memory channel layer, SQLite).

## Inspected modules

- **Read in detail:** `canteenapp/models.py`, `views.py`, `consumers.py`, `signals.py`, `apps.py`, `routing.py`; `canteen/settings.py`, `urls.py`, `asgi.py`; and `canteenapp/templates/adminassignorder.html`.
- **Scanned:** every Python module of `canteenapp`, using [`Part1/evidence/scan_candidates.sh`](Part1/evidence/scan_candidates.sh); output in [`candidate_scan.txt`](Part1/evidence/candidate_scan.txt).
- **Excluded:**
  - the other 62 templates and the static assets (presentation only);
  - 17 migration files (generated schema history);
  - framework internals of Django, Channels and social-auth (roles taken from their documentation).

## Commands

Run from this folder unless stated otherwise.

| What | Command | Recorded result |
|---|---|---|
| Baseline check | `python3 data/code/verify_baseline.py` | 167 identical, 2 redacted, 1 omitted |
| Candidate scan | `bash Part1/evidence/scan_candidates.sh > Part1/evidence/candidate_scan.txt` | see file |
| CH01 Django tests (in the evolved app, with the validation environment from `Part2/changes/Change1/verification/commands.md`) | `python manage.py test canteenapp.test_delivery_assignment --verbosity 2 --noinput` | 39 tests OK, exit 0 (`Part2/changes/Change1/evidence/tests-default-final.log`) |
| CH01 system check | `python manage.py check` | exit 0, 1 deprecation warning (`check-default-final.log`) |
| CH01 migration check | `python manage.py makemigrations --check --dry-run` | No changes detected (`migrations-check.log`) |
| CH01 dependency check | `python -m pip check` | exit 1, six conflicts among baseline pins (`pip-check-final.log`) |
| CH01 UI script tests | `cd Part2/changes/Change1 && ln -s ../../../data/code/evolved_CH01 working && node verification/test_assignment_ui.cjs` | 9 passed (`evidence/ui-tests.log`; re-run in `rerun_2026-10-11/`) |
| CH01 metrics | `python3 Part2/changes/Change1/metrics/measure_ch01.py` | `Part2/changes/Change1/metrics/ch01_metrics.csv` |
| Part 3 tests | `bash Part3/order_events_and_delivery_selection/<language>/run_tests.sh` | Observer 3/3, Strategy 2/2, full output 1/1 (`Part3/evidence/test_<language>.log`) |
| Part 3 metrics and timing | `cd Part3 && python3 tools/measure.py` (needs `pip install lizard`) | `Part3/evidence/static_metrics.csv`, `timing_raw.csv`, `timing_summary.csv` |
| Diagrams | `dot -Tpdf X.dot -o X.pdf; dot -Tpng -Gdpi=150 X.dot -o X.png` | `Part1/pattern_architecture/`, `Part2/diagrams/` |
| Report and slides | `latexmk -pdf A1_Report.tex`; `cd Part3/llm && latexmk -pdf A1_slide.tex` | `A1_Report.pdf`, `A1_slide.pdf` |

The Django test result comes from the CH01 logs. The UI tests and the patch check were re-run on 2026-10-11.

## Measurement rules

- **Pattern counts.** An instance is one independent collaboration in one source version. Language demonstrations and unimplemented proposals are not counted.
  - *Concrete participant classes:* classes in a variable role (ConcreteObserver, ConcreteStrategy). A function in such a role adds none.
  - *Unique participant symbols:* classes, module-level functions or objects mapped to a GoF role. Methods count with their class, and shared symbols count once. Supporting rows (registration, wiring, callers, data) are not counted. Totals: baseline 13, after CH01 17.
- **Line ranges:** taken from Python's `ast` module, decorators included.
- **Source LOC:** non-blank, non-comment lines, tests excluded. Part 3 lines are split into Observer, Strategy and shared scaffolding by markers in `Part3/tools/measure.py`. The split is saved in `Part3/evidence/line_partition.json`.
- **Cyclomatic complexity:** lizard 1.24.1 CCN per function, i.e. 1 plus the decision points (`if`, loops, `case`, `catch`, `&&`/`||`/`and`/`or`, comprehension conditions). The report gives the maximum over functions that start in the measured part. Lizard counts JavaScript arrow functions as separate functions.
- **Timing:**
  - Procedure: compile first (outside the submission; nothing is kept), run once to warm up, then take five measured runs on the same machine and report the median.
  - Measured span: wall-clock time of the whole process, including runtime start-up, both pattern sections and output capture; compilation is excluded.
  - Combined figures only: each program runs both patterns in one process. Medians: Java 70.7 ms, Python 18.9 ms, JavaScript 34.7 ms, C++ 1.9 ms. The per-pattern `median_process_ms` cells in `data/cross_language.csv` are therefore blank.

## Datasets (one canonical copy each, in `data/`)

| File | Rows |
|---|---|
| [`data/patterns.csv`](data/patterns.csv) | 2 (baseline instances) |
| [`data/pattern_counts.csv`](data/pattern_counts.csv) | 7 (baseline and after CH01) |
| [`data/pattern_evolution.csv`](data/pattern_evolution.csv) | 5 (2 baseline + 3 after CH01) |
| [`data/cross_language.csv`](data/cross_language.csv) | 8 (2 patterns × 4 languages) |
| [`data/llm.csv`](data/llm.csv) | 4 (3 historical, 1 report production) |

**Naming.** The faculty documents use more than one name for some datasets (`Pattern_count.csv`, `patterns_evolution.csv`, `pattern_evalution.csv`, `pattern_crosslanguage.csv`) and ask that the CSVs not be repeated inside the part folders. Each dataset is therefore kept once, in `data/`, under the names above, with the column names exactly as in the instructions. All paths inside the CSVs are relative to this folder.

**Earlier datasets.** The simpler datasets from `DP.zip` are kept unchanged in [`data/legacy_datasets/`](data/legacy_datasets/). The canonical CSVs supersede them.

## Evidence locations

[`data/test_result/EVIDENCE_INDEX.md`](data/test_result/EVIDENCE_INDEX.md) maps each claim to its file:

- Part 1: `Part1/evidence/`, `Part1/pattern_architecture/`
- CH01: `Part2/changes/Change1/`
- Part 3: `Part3/evidence/`
- Provenance and redactions: `data/provenance/`
- LLM records: `data/llm/`, `Part1/llm/`, `Part2/llm/`
- GitHub screenshot: `data/test_result/github_team_folder_82a5d58.png`

## Limitations

- CH02 and CH03 were not implemented.
- The baseline dependency pins conflict; CH01 was validated in a `--no-deps` environment.
- Firebase delivery and browser rendering were not tested.
- The baseline delivery-assignment event (`delivery_person_<id>`) has no live subscriber, and CH01 keeps it as it was.
- The Part 3 programs predate CH01, and their Strategy models the earlier availability/priority proposal.
- Historical LLM prompts were not recorded; only pasted outputs survive. The team states that no AI tool wrote the CH01 code or the Part 3 programs.
