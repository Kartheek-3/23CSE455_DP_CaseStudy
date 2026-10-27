# Evidence index (paths relative to the team folder)

| Claim | Evidence |
|---|---|
| Baseline commit and archive hash | `data/provenance/provenance.json` |
| Baseline copy against the 170 upstream hashes (167 identical, 2 redacted, 1 omitted) | `data/code/verify_baseline.py`, `data/provenance/baseline-files.sha256.json`, `data/provenance/REDACTIONS.md` |
| Earlier team download equals the baseline; screenshot shows short hash 8399862 | `data/provenance/recovery/manifest.csv`, `data/provenance/github_repository_page_2026-09-12.png` |
| Only four files changed in CH01 | `data/provenance/changed-files.json`, `Part2/changes/Change1/CH01.diff` |
| Diff applies to the baseline and reproduces the evolved files | `Part2/changes/Change1/evidence/diff-check.exit`, `Part2/changes/Change1/rerun_2026-10-11/RECHECKS.md` |
| Pattern candidates, publishers, subscribers, rejected items | `Part1/evidence/candidate_scan.txt` (script `Part1/evidence/scan_candidates.sh`) |
| Pattern diagrams (source + rendered) | `Part1/pattern_architecture/*.dot|.pdf|.png`, `Part2/diagrams/*` |
| CH01: 39 Django tests OK | `Part2/changes/Change1/evidence/tests-default-final.log` (+ `.exit`) |
| CH01: 9 UI script tests | `Part2/changes/Change1/evidence/ui-tests.log`; re-run `Part2/changes/Change1/rerun_2026-10-11/ui-tests-rerun.log` |
| CH01: `manage.py check`, migrations check | `Part2/changes/Change1/evidence/check-default-final.log`, `migrations-check.log` |
| CH01: six dependency conflicts | `Part2/changes/Change1/evidence/pip-check-final.log` |
| CH01: earlier failed attempts (kept, not final) | `Part2/changes/Change1/evidence/tests-attempt1.log`, `tests-scoped-*.log`, `install*.log` |
| CH01: environment | `Part2/changes/Change1/evidence/runtime-versions.txt`, `environment-freeze.txt`, `Part2/changes/Change1/verification/commands.md` |
| CH01: before/after metrics | `Part2/changes/Change1/metrics/ch01_metrics.csv` |
| Part 3: demos unchanged | `data/provenance/demonstrations-before.json` (hashes), `data/provenance/preservation-check.log` |
| Part 3: test results per language | `Part3/evidence/test_java.log`, `test_python.log`, `test_javascript.log`, `test_cpp.log` |
| Part 3: LOC/CC | `Part3/evidence/static_metrics.csv`, `lizard_functions.csv`, `line_partition.json` |
| Part 3: timings (combined demo process) | `Part3/evidence/timing_raw.csv`, `timing_summary.csv`, `measurement_date_utc.txt`, `toolchain_versions.txt` |
| LLM records | `data/llm.csv`, `data/llm/`, `Part1/llm/`, `Part2/llm/` |
| GitHub listing of the uploaded team folder (commit 82a5d58) | `data/test_result/github_team_folder_82a5d58.png` (report Figure 5) |
| Slides | `Part3/llm/A1_slide.pdf` (source `A1_slide.tex`) |
