# B16 – Design Pattern Analysis and Evolution in the JUnit 6 Testing Framework

23CSE455 Design Patterns, case study report and team folder.

| Roll number | Student name | Batch |
|---|---|---|
| AM.SC.U4CSE23319 | Gautham Mohanraj | CSE D |

## Application and versions
- **Application:** JUnit 6.1.3, https://github.com/junit-team/junit-framework/tree/r6.1.3, baseline commit `f59f60d2cebdf2224235d81f781b1f310cbc8138` ("Release 6.1.3"). License: Eclipse Public License 2.0 (`data/code/LICENSE.md`).
- **Inspected modules** (production code `src/main/java` only): `junit-platform-engine`, `junit-platform-launcher`, `junit-jupiter-api`, `junit-jupiter-engine`. Unchanged copy in `data/code/`.
  - **Not inspected:** `junit-platform-commons`, the console, suite, reporting, testkit, Vintage and params modules, and all test code. These are outside the four areas of the case study (discovery, engines/lifecycle, listeners/reporting, Jupiter extensions).
- **Tools, all run on a Mac with Apple M3 (Darwin arm64) on 2026-10-10:**
  - **Build and test JUnit:** OpenJDK 25.0.4.1, Gradle wrapper from the JUnit repository.
  - **Part 3 languages:** Java 25.0.4.1, Python 3.14.2, Node.js 26.11.1, Apple clang 21.0.0 (C++20).
  - **Metrics:** lizard 1.24.1.
  - **Diagrams:** PlantUML.
  - **Report:** LaTeX (tectonic).
- **Evolved JUnit:** fork branch `b16-evolution`, with commits `68a60e4`, `6f98fbf` (CH03), `67d159b`, `e55fefe` (CH01) and `99987b0` (CH02). The evolved source is in `Part2/code/`, and the diffs are in `Part2/changes/ChangeN/`.

## Versions in the datasets
| `source_version` | Commit on `b16-evolution` | Contains |
|---|---|---|
| Original code | `f59f60d` | JUnit 6.1.3 |
| Code after Change3 | `6f98fbf` | CH03 (applied first, with refactoring `68a60e4`) |
| Code after Change1 | `e55fefe` | CH03 + CH01 (refactoring `67d159b`) |
| Code after Change2 | `99987b0` | CH03 + CH01 + CH02 |

Paths in the CSVs are relative to this folder:
- the original version uses `data/code/`;
- the final version uses `Part2/code/`;
- the two intermediate versions are written `path @commit`. Their exact differences are in `Part2/changes/ChangeN/*.diff`.

## Measurement rules (used everywhere)
- **Pattern counting:**
  - One instance is one collaboration.
  - Two concrete classes in one collaboration still make one instance.
  - Overlapping views of the same classes (A2/A3, B1/B2) are counted separately, with a note.
  - **Composite rule:** a class counts as a Composite only if it combines children of its own interface **and** merges their answers into one result.
  - Before/after observations are not new instances; only N1 and N2 are new collaborations.
- **Line ranges** in the CSVs are found automatically in the source: from a declaration line to its matching closing brace (`data/build_part1_csv.py`, `data/build_part2_csv.py`). They are never typed by hand.
- **Source LOC and complexity:** lizard 1.24.1.
  - NLOC counts lines with code, without blanks, comments or docstrings.
  - CCN is 1 plus one per `if`/`for`/`while`/`case`/`catch`/`&&`/`||`/`?`.
  - Only production code is counted, never tests.
- **Test counts:** read from each JUnit XML result's testsuite name (`Part2/evidence/count_tests.py`). Gradle shortens some file names, so file names are not used. Every run used `--rerun --no-build-cache` with the old results deleted first, so no result came from Gradle's cache.
- **Part 3 timing:** wall-clock time of the whole process (runtime start-up + reading input + work + output), measured from Python around `subprocess.run` after compiling. One warm-up and five measured runs on the same machine; the median is reported and the raw times are kept (`Part3/timing-raw.csv`). The working folder for every command is the language folder, `Part3/<problem>/<language>/`.

## Folder guide
| Path | Content |
|---|---|
| `B16_Report.tex` / `B16_Report.pdf` | the report |
| `Part3/B16_slide.pdf` (source `Part3/B16_slide.tex`) | short slide deck (placed in Part3 as in the assignment's folder tree) |
| `B16_dataset.xlsx` | all CSV datasets as sheets (built by `data/build_workbook.py`) |
| `screenshots/` | GitHub screenshots of the team folder (report section 7) |
| `data/` | **the one dataset folder:** `patterns.csv`, `pattern_counts.csv` (every version), `cross_language.csv`, `llm.csv`; baseline source `code/`; `test_result/` (test logs + index); generator scripts |
| `Part1/` | `Part1_prompt.txt`, `llm/` (exact prompts + raw outputs), `evidence/` (verification, line checks), `uml/` (35 diagrams), `architecture/`, `notes.md` |
| `Part2/` | `code/` (evolved source + demos), `changes/Change1..3/` (requirement, diffs, test logs, demo logs), `pattern_evolution.csv`, `uml/`, `Part2_prompt.txt`, `llm/`, `evidence/` |
| `Part3/` | one folder per pattern type (10: `observer-test-listeners/`, `composite-test-tree/`, `strategy-test-filters/`, `adapter-listener-bridge/`, `decorator-timeout-invocation/`, `template-method-engine/`, `command-task-queue/`, `null-object-listener/`, `chain-of-responsibility-interceptors/`, `factory-method-executors/`), each with java, python, javascript, cpp and test-data, `llm/` (`part3_prompt.txt`, raw output, verification), `evidence/test_results/` (one test log per program), run logs, timing and lizard raw output, `measure.py` |

The four dataset CSVs are kept once, in `data/`, as the instructions require ("Do not repeat the four CSVs inside them"). The Part folders hold the supporting code and evidence.

## Reproducing the source versions
- **Original:** `data/code/`, the same files as `junit-team/junit-framework` at `f59f60d` (tag `r6.1.3`).
- **Changed versions:** `Part2/changes/b16-evolution.bundle` holds the 5 commits on top of `r6.1.3`. To recreate them:
  1. `git clone https://github.com/junit-team/junit-framework && cd junit-framework`
  2. `git fetch <path>/b16-evolution.bundle b16-evolution:b16-evolution && git log --oneline r6.1.3..b16-evolution`
- **Final version:** also saved as `Part2/code/`. Each step is also in `Part2/changes/ChangeN/*.diff`.

## How to reproduce
- **Datasets:** from this folder, run `python3 data/build_part1_csv.py`, `python3 data/build_part2_csv.py` (needs the JUnit fork at `~/Desktop/dp-work/junit-framework`), then `python3 data/assemble.py`.
- **Part 2 demos:** from `Part2/code/demo`, run `./run_ch01.sh`, `./run_ch02.sh` and `./run_ch03.sh` (needs `JAVA_HOME` and the console jars listed in each script).
- **Part 3:** from `Part3`, run `sh run-all.sh`, then `python3 measure.py`.

## Limitations
- **Scope:** only the production code of four modules was analysed. Patterns in commons, console, suite, reporting, Vintage or test code are not counted.
- **Pattern recognition depends on the stated rules.** For example, the `Composite*Listener` classes are "uncertain" under the Composite rule. Another reviewer could count differently.
- **Part 3** has one small problem per detected pattern type (10 problems × 4 languages). Each is a simplified model of one Part 1 instance, not JUnit code itself.
- **Timings** come from one machine and are dominated by runtime start-up. They compare languages, not pattern implementations.
- **Change limitations:**
  - CH03: a method regex cannot contain a comma.
  - CH01: only tests are summarised, not containers.
  - CH02: constructor parameters are not supported.
- **Metrics:** lizard does not analyse methods inside Java `record`s. Those two methods were counted by hand with lizard's rule.
- **Demos:** the demo scripts in `Part2/code/demo/` need the official and evolved console jars (not uploaded, since they are compiled binaries). The evolved jar is built from the bundle with `./gradlew :junit-platform-console-standalone:jar`.

## Use of AI
All AI use is recorded in `data/llm.csv`, with the prompt, input, raw output, evaluation and verification file for each step.
- **Parts 1 and 3:** analysis prompts and the Part 3 Observer and Composite programs came from Claude Opus 5.5 on claude.ai. The other eight Part 3 problems (32 programs) were written by Claude Code.
- **Part 2:** the code for the three changes, the tests, the demos and the measurement scripts were produced with Claude Code (Claude Opus 5.5), following plans I approved.
- **Checking:** every claim was checked against source, tests or measurements, as recorded in `Part1/evidence/verification.csv`, `Part2/evidence/verification.csv` and `Part3/llm/verification.csv`.
