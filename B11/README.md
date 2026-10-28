# B11 — Design Pattern Case Study

**Course:** 23CSE455 Design Patterns
**Case study:** Design Pattern Identification and Evolution in a Spring Boot-Based Legal Case Management Application

## Team

| Roll number | Name | Batch |
|-------------|------|-------|
| Am.sc.u4cse23237 | Lokesh | CSE |
| Am.sc.u4cse23249 | Sai Tharun | CSE |
| Am.sc.u4cse23268 | Rakshann | CSE |
| Am.sc.u4cse23311 | Nithilesh | CSE |

## Application under study

- **Source:** https://github.com/vikash0439/legalSystem
- **Baseline commit:** `4e4ebb574d6730614855899e032fd5a79b04da63` (2023-03-18)
- **Access date:** 2026-10-10
- **License:** No LICENSE file present in the repository. Used for non-commercial academic study only (course fair-use scope), with the original author credited.
- **Domain:** Legal case management (cases, lawyers, hearings, documents, payments, reminders)

## Environment (baseline app)

- Java 8 (built/targeted; repo states JVM 1.8.0_171)
- Spring Boot 2.4.0, Spring Security, Spring Data JPA, Hibernate 5.3
- MySQL, JSP 2.2, Maven (mvnw wrapper included)

## Environment (Part 3 cross-language snippets — measured on the submission machine)

Apple Silicon macOS (Darwin 27.0.0):

- Java: OpenJDK 11.0.32 (Homebrew)
- Python: CPython 3.9.6
- JavaScript: Node.js 25.9.0
- C++: Apple clang 21.0.0, compiled `-O2 -std=c++17`

> The timings in `data/cross_language.csv` were measured on this machine with
> `Part3/measure.py` (compile once, 1 warmup, 5 measured runs, median). If you
> re-run on different hardware, regenerate the CSV so the reported numbers match.

## Inspected modules

`rest/`, `main/` (controllers), `service/`, `repository/`, `modal/` (entities),
`config/` (security), `mail/` (notifications), `LegalAppApplication.java` (scheduler).
**Excluded:** JSP views, static assets, `bin/`, `DB_backup/`, `.recommenders/` — not application logic.

## Run / test commands (baseline app — requires MySQL)

```
# From the cloned legalSystem repo root:
./mvnw spring-boot:run        # needs a MySQL DB named 'legal' (see application.properties)
```
> The password encoder in `config/SecurityConfiguration.java` is stubbed (compares
> plaintext); the app is for study only, not production use.

## Run commands (Part 3 snippets)

See `Part3/<pattern>/README.md`. All four languages of a pattern print identical output
(evidence: `test_result/part3_output.txt`).

## Measurement rules

- **source_loc:** non-blank, non-comment production lines (tests/README excluded). Counting script: `Part3/measure.py`.
- **max_function_cc:** maximum per-function cyclomatic complexity, measured with **lizard** (`pip install lizard`; run `lizard <file>` and take the max CCN). Values in cross_language.csv are the real lizard output.
- **median_process_ms:** compile once → 1 warmup run → 5 measured runs → median. Measured time = full process (startup + snippet), stdout suppressed.

## Repository layout

```
B11/
  README.md
  B11_Report.tex          # report source (rebuild the PDF after any edit)
  B11_Final_Report.pdf    # generated from the .tex (tectonic/pdflatex B11_Report.tex)
  data/   patterns.csv  pattern_counts.csv  patterns_evolution.csv  cross_language.csv  llm.csv
  code/                   # place a copy/snapshot of the baseline app source (see note)
  test_result/            # test outputs + (add) screenshots
  Part1/  evidence/  llm/
  Part2/  code/changes/{Change1,Change2,Change3}/  diagrams/  llm/
  Part3/  strategy/ adapter/ template_method/ observer/  (each: java python javascript cpp)  llm/  measure.py
```

## Limitations / honesty notes

- Observer is recorded as **uncertain** at the baseline (scheduler-driven, no
  subject-observer registration); CH02 evolves it into a true Observer.
- Dependency Injection and Repository are **framework idioms**, not hand-written GoF.
- Part 2 changes were applied to the baseline clone, committed
  (`4e4ebb57` → `c31ce44`), unit-tested (`./mvnw test` → 7 tests, 0 failures;
  `test_result/mvn_test.log`), and the full app was booted against MySQL
  (`test_result/app_startup.log`, screenshot `test_result/app_screenshot.png`).
  Integration findings are recorded honestly in `test_result/ENVIRONMENT_NOTES.md`
  (the CH01 `@Primary` fix for two `FinePolicy` beans; the baseline JUnit-4 test vs
  Spring Boot 2.4 dropping JUnit Vintage).
- `code/legalSystem_src/` holds a snapshot of the baseline source at the recorded
  commit for reproducibility (no dependency caches or compiled binaries committed).
