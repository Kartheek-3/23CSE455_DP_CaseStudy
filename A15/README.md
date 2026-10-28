# Team A15 - 23CSE455 Design Patterns case study

Application: Quarkus bank REST API (`br.com.michaelcruz`, Quarkus 3.6.1, Java 17, MySQL).
Source: `https://github.com/dev-MichaelCruz/api-quarkus`, supplied as `api-quarkus-main.zip`, no license file, accessed 2026-10-11.
Members: Hariprid V (AM.AI.U4AID23009), Pranav R Menon (AM.AI.U4AID23017), Sreyas A (AM.AI.U4AID23022). Team name, faculty approval: PLACEHOLDERS (see `A15_Report.pdf`).

## Layout
- `A15_Report.tex/.pdf` - report (sections 1-7)
- `data/code` - baseline source (commit baa96db; DB password replaced by `${DB_PASSWORD:change-me}`)
- `data/test_result` - sandbox harness, baseline test sources and log, tools (generators, `javaloc.py`)
- `Part1` - `patterns.csv`, `Pattern_count.csv`, `llm.csv`, prompts, LLM inputs/outputs, diagrams, evidence
- `Part2` - `code` (final, after Change 3), `changes/Change1..3` (requirement, patch, test log), `pattern_evolution.csv`, `Pattern_count.csv`, `llm.csv`, diagrams
- `Part3` - 10 problem folders x (java, python, javascript, cpp, test-cases), `llm/` (`pattern_crosslanguage.csv`, `llm.csv`, prompts, `A15_slide.pdf`), `evidence/`

## Member Reference
For consistency across the report, source files, prompts, evidence, and other project artifacts, the following abbreviations refer to the respective team members:

* **Member 1 (M1):** Hariprid V (AM.AI.U4AID23009)
* **Member 2 (M2):** Pranav R Menon (AM.AI.U4AID23017)
* **Member 3 (M3):** Sreyas A (AM.AI.U4AID23022)

The terms `Member 1`, `M1`, `Member 2`, `M2`, `Member 3`, and `M3` should be interpreted according to these mappings wherever they appear in the project documentation or supporting artifacts.


## Local commits
baseline baa96db, c0 c9d7097 (tests added), change1 6bdf74e, change2 c755d20, change3 b8de930.

## Environment and how to run
OpenJDK 21.0.12.1, Python 3.13, Node 22, g++ 13.3, lizard 1.24.1.
- Real build: `cd Part2/code && ./mvnw test` (**NOT run** - Maven Central was unreachable here; please run it before submitting).
- Harness actually run: `bash data/test_result/harness/run_tests.sh` (baseline 15/15; Change1 23, Change2 30, Change3 37 passing).
- Part 3, per snippet: see the README inside each language folder (compile first, runner reads `../test-cases/cases.txt`).

## Measurement rules
LOC = non-blank, non-comment lines of the snippet. CC = max function cyclomatic number, lizard 1.24.1. Time = median of 5 runs after 1 warm-up, whole process (start-up + reading fixture), compilation excluded; shared 2-vCPU container, indicative only.

## Limitations
Quarkus/JPA/transaction behaviour not verified (stubs harness); Part 3 snippets are simplified; fixtures written by the same LLM; all prompts were run in one session (members may replay theirs); human review sign-off pending; `output_ch0N.md` are design notes, the patch is the generated code.

## File-name notes
The PDFs disagree on duplicating CSVs inside parts; one copy is kept at the explicit-tree location. Cross-language CSV is `pattern_crosslanguage.csv`; Part 2 prompt is `Part2_prompt.txt` (tree says .text).
