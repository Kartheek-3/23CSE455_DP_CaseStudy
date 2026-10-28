# Missing or unverified materials

Status as of inspection of the accessible workspace on 2026-10-11. “Not found” means not present in the accessible files, not proof that a teammate never created it elsewhere.

## Baseline and source history
- The Django project ZIP is present, but no `.git` metadata/history is inside it.
- A screenshot of the GitHub repository page shows `main` and short commit prefix `8399862`; it does not prove the full commit hash or which snapshot the team checked out.
- The candidate `fe5bb739661ad29a088bd70a60de792d8742014b` is not confirmed as the team-selected baseline by the accessible messages/files.
- No branch/tag record, `git log`, commit object, or original checkout log was found.

## Change scenarios CH01–CH03
- `change_scenarios.csv` contains proposed changes, not evidence of completed Django implementations.
- No modified Django source tree for CH01–CH03 was found.
- No before/after source snapshots, Git diffs, patches, commits, acceptance-test scripts, or application test output/logs were found.

## Cross-language demonstrations
- Java, Python, JavaScript and C++ source files exist in `02_language_demos/`.
- The CSV records successful commands/results. These records are not raw terminal logs.
- No actual terminal output files or four-language output screenshots were found in the accessible workspace.
- No measured median process timings or raw timing runs were found. Do not estimate timings.

## Datasets
Found: `pattern_inventory.csv`, `change_scenarios.csv`, `four_language_execution.csv`, `Part3j_Design_Patterns_Datasets.xlsx`.
Not found in the teacher-required schemas: `patterns.csv`, `pattern_counts.csv`, `patterns_evolution.csv`, `cross_language.csv`, `llm.csv`.

## LLM audit trail
- No exact original prompt files, complete raw model outputs, full conversation export, model identifier/access-tier record, or prompt-by-prompt verification files were found.
- The available Markdown notes contain prior analysis and summarized reasoning, but should not be relabeled as exact original prompts or raw outputs.
- The conversation URL supplied in the user request was not directly accessible as a complete transcript from this workspace.

## Report and diagrams
- `casestudy.tex` exists and is a placeholder template, not a completed report.
- Two case-study PDFs are available.
- No completed final report PDF, README from the team submission, editable UML source, rendered architecture/UML diagram files, or complete team-folder structure was found among the accessible materials.
- The only available screenshot is a GitHub repository page, not a test result.

## No secrets copied intentionally
The original project archive includes `.env.example` only among environment-file names found during inspection; no `.env` file was listed. This is not a comprehensive security audit of every source string.
