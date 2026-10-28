# Team A13: Design Pattern Case Study

**Topic:** Design Pattern Analysis in a Vue.js-Based Social Media Application
**Application:** Misskey, an open-source federated social media platform (Vue 3 frontend, NestJS backend)

## Team details

| Roll number | Name | Batch |
|---|---|---|
| AM.SC.U4CSE23156 | Sreehari M | CSE B |
| AM.SC.U4CSE23148 | Rohit Prasanth | CSE B |
| AM.SC.U4CSE23157 | Sreyas S Sankar | CSE B |
| AM.SC.U4CSE23173 | Sreevisakh A | CSE B |
| AM.SC.U4CSE23168 | Vighnesh H | CSE B |

## Source application

- Repository: https://github.com/misskey-dev/misskey (version `2026.10.0`, licence GNU AGPL-3.0)
- Baseline commit (Parts 1 and 2): `5f501341d49d2bc3fa7e817ce7548a82174326eb`
- Part 3 source check: `53ac6808ae4921305e761c545863ee6593edd1f4` (one commit after the baseline); the cited line ranges were re-read there
- Changed versions: CH01 `608b45de20dce0a78459025320bfdeb0c4e47a78`, CH02 `9a4398a103e392a0ea634eaf521470985985145d`, CH03 `39e3c987488d59045cc3ed5cfe532f6f32c0936d`, CH04 `b3040278d3e63cf4ced915f9623b95969ff42010` (`Part2/code/README.md`)
- Stack: frontend Vue 3.5.42 (`packages/frontend`), backend NestJS 11.2.3 (`packages/backend`), client library `packages/misskey-js`
- The upstream repository is not copied here; versions are referenced by commit (`data/code/README.md`).

## Folder guide

| Path | Content |
|---|---|
| `A13_Report.tex`, `A13_Report.pdf` | Case study report and its source |
| `data/` | The dataset CSVs named in the report template: `patterns.csv`, `pattern_counts.csv`, `patterns_evolution.csv`, `cross_language.csv`, `llm.csv` |
| `Part1/` | Pattern discovery: `patterns.csv`, `pattern_counts.csv`, architecture diagram, prompt, `llm.csv` |
| `Part2/` | Evolution and refactoring: evolved source, `changes/Change1-4`, diagrams, `pattern_evalution.csv`, `Pattern_count.csv`, `llm.csv` |
| `Part3/` | Cross-language comparison: 60 implementations, fixtures, evidence, LLM records, report and slides |
| `test_result/` | Pointer to where each part keeps its test logs |

The per-part CSV files follow the assignment's folder tree; `data/` holds the consolidated copies named in the report template. Each part has its own README.

## Results at a glance

| Part | Result | Details |
|---|---|---|
| 1 Pattern discovery | 22 pattern instances in 17 pattern types, with participants and line ranges at the baseline | `Part1/README.md` |
| 2 Evolution | 4 changes (events with RSVP, audio transcription, link safety, personalized feed); 91 tests in the final test run; pattern instances 14 to 19 | `Part2/README.md` |
| 3 Cross-language | 15 pattern types implemented in Java, Python, JavaScript and C++ (60 snippets, 97 shared cases, all passing) | `Part3/README.md`, `Part3/A13_Part3_Report.pdf` |

## Running and testing

- **Part 1:** no executable code; evidence is in `Part1/patterns.csv` and the diagram.
- **Part 2:** unit tests for the four changes are under `Part2/code/packages/backend/test/unit/`; recorded runs are in `Part2/changes/ChangeN/test_result.log`.
- **Part 3:** from each `Part3/code/pattern_<name>/<language>/` folder, run the command in that folder's README, for example `python3 -B test_logging_factory.py ../../../test-cases/factory.txt`.

Tools used for Part 3: OpenJDK 17.0.19, CPython 3.14.6, Node.js v24.15.0, g++ 16.1.1 (`-std=c++17`), lizard 1.24.1. Measurement rules (LOC, cyclomatic complexity, timing) are in `Part3/README.md`.

## Limitations

- The Part 1 baseline (17 types, 22 instances) and the Part 2 baseline counts (11 types, 14 instances) were produced separately and use different pattern vocabularies.
- Part 2 implements four changes; the assignment asks for three.
- Of the 15 Part 3 instances, 4 are in the Vue frontend and 11 in the NestJS backend; four are only partly supported by the source (Factory, Front Controller, Service Layer, Repository).
- Part 3 timings are from one machine and include process start-up; the warm-up time was not stored.
- LLM use is recorded in `data/llm.csv` (12 records: Part 1, Part 2 and Part 3). Part 3 review entries are in `Part3/llm/verification/human_review_checklist.md`.
- `A13_Report.pdf` was generated directly from the report content because no LaTeX toolchain was available, so `A13_Report.tex` has not been compiled.
