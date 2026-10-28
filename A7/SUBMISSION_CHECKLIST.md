# SUBMISSION CHECKLIST

Legend: PASS = verified; FAIL = unresolved; N/A = not applicable.

| Item | Status | Evidence / note |
|---|---|---|
| Team name correct | PASS | Team A7 in report, slides, README |
| Contribution attribution reconciled | FAIL — team action required | README and report now consistently mark individual contributions as pending confirmation; confirm with all members and update both documents before submission |
| Submission date metadata | PASS (conservative) | Report and slides mark the date unverified; the unsupported 6 September 2027 assertion is not presented as confirmed |
| Student details correct | PASS | Roll numbers AM.AI.U4AID23016, 23037, 23040, 23046 in A7_Report.tex |
| Baseline commit recorded | PASS | `5e15551ee646871b4bed32c982fa17da319d3ee3` in README and report |
| Original source included | PASS | Complete upstream baseline in `data/code/` with 171 files matching SHA-256 manifest |
| README complete | PASS | Root README.md |
| Report .tex included | PASS | A7_Report.tex |
| Final PDF included | PASS | A7_Report.pdf |
| Slides included | PASS | A7_slide.tex and Part3/llm/A7_slide.pdf (13 physical pages) |
| Part1 patterns.csv | PASS | Canonical dataset in data/patterns.csv |
| Part1 pattern_counts.csv | PASS | Canonical dataset in data/pattern_counts.csv |
| Part1 UML source | PASS | Part1/pattern_architecture.puml |
| Part1 UML image | PASS | Part1/pattern_architecture.png |
| Part1 prompt | PASS | Part1/Part1_prompt.txt |
| Part1 llm.csv | PASS | Canonical entry in data/llm.csv |
| Part2 evolved source | PASS | Part2/code/ with full evolved application layer |
| Change1 requirement/diff/test result | PASS | Part2/changes/Change1/ |
| Change2 requirement/diff/test result | PASS | Part2/changes/Change2/ |
| Change3 requirement/diff/test result | PASS | Part2/changes/Change3/ |
| Part2 patterns_evolution.csv | PASS | Canonical dataset in data/patterns_evolution.csv |
| Part2 pattern_counts.csv | PASS | Canonical dataset in data/pattern_counts.csv |
| Part2 UML sources | PASS | Six PlantUML diagrams in Part2/diagrams/ |
| Part2 UML images | PASS | Six PNG renderings |
| Part2 checkpoints reproducible | PASS | Four checkpoint trees match rebuild recipe, SHA-256 manifest, and patch replay |
| Part2 metrics | PASS | Part2/metrics/before_after.csv and ruby_ast_metrics.json |
| Part2 prompt | PASS | Part2/Part2_prompt.txt with recovery note |
| Part2 llm.csv | PASS | Canonical entry in data/llm.csv |
| Part3 Java | PASS | Template Method + Strategy in Part3/ |
| Part3 Python | PASS | Template Method + Strategy in Part3/ |
| Part3 JavaScript | PASS | Template Method + Strategy in Part3/ |
| Part3 C++ | PASS | Template Method + Strategy in Part3/ |
| Part3 test cases | PASS | Part3/test-cases/specification.txt |
| Part3 evidence | PASS | Raw timing logs in Part3/evidence/ |
| Part3 prompt | PASS | Part3/llm/part3_prompt.txt |
| Cross-language CSV | PASS | data/cross_language.csv with measured medians |
| Actual timing measurements | PASS | 1 warmup + 5 measured runs per language/pattern |
| All Part3 tests executed | PASS | 8 snippets executed |
| LLM records verified | PASS | Historical metadata explicitly marked unknown where unverifiable |
| No fabricated evidence | PASS | Unknowns and environment limits are explicit |
| No secrets | PASS | check_submission.py secret scan |
| Baseline integrity | PASS | All 171 upstream files match SHA-256 manifest |
| Canonical datasets only in data/ | PASS | No duplicate mirrors in Part1/, Part2/, or Part3/llm/ |
| Final submission-ready | FAIL — team action required | Archive structure and automated checks are addressed; actual team contributions must still be confirmed and recorded consistently before submission |

## Environment
- Ruby 3.3.8 (syntax validation only for Part 2 — no Bundler/Rails runtime)
- Rails baseline dependency: Rails ~7.0.4, Ruby 2.7.5 as recorded by upstream Gemfile
- Java OpenJDK 21.0.11
- Python 3.13.5
- Node.js v22.16.0
- g++ 14.2.0

## Important notes
- Part 2 Rails/RSpec integration tests were executed in a prior session; receipts are retained but not re-executed in the current packaging environment.
- LLM historical model/date/access tier for prompts 02 and 03 are unrecoverable and marked as such.
- Experiment 07 is a genuine new verification interaction, not a recovery.
