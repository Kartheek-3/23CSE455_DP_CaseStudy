# Design Pattern Case Study — Hotel Booking Application

**Case study:** Design Pattern Analysis and Evolution in a Ruby on Rails Hotel Booking Application  
**Original application:** [andrewdsilva/rails-room-booking](https://github.com/andrewdsilva/rails-room-booking)  
**Baseline commit:** `5e15551ee646871b4bed32c982fa17da319d3ee3`  
**Submission team:** Team A7  
**Department / Batch:** Department of AI & Data Science (AI & DS), Class of 2023–2027  
**Course:** 23CSE455 — Design Patterns

## Team Members and Contributions

| Roll Number      | Name                | Department | Proposed responsibility area                                                                                                                                                                                                                                                                                                            | Evidence to review                                                                                                                                                                           |
| ---------------- | ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AM.AI.U4AID23016 | Kavya Penikalapati  | AI & DS    | **Part 1 — Baseline pattern discovery:** review the baseline source, verify the Template Method participant mapping for `CrudConcern` and the resource controllers, and review the baseline pattern evidence, architecture diagram, and pattern inventory.                                                                              | `Part1/evidence/baseline-pattern-evidence.md`; `Part1/pattern_architecture.puml`; `Part1/pattern_architecture.png`; `data/patterns.csv`; `data/pattern_counts.csv`                           |
| AM.AI.U4AID23037 | E. Abhijith Krishna | AI & DS    | **Part 2 — Additional services:** review or implement Change 1, covering optional booking services and pricing; review its requirements, source diff, checkpoint, and test evidence.                                                                                                                                                    | `Part2/changes/Change1/`; `Part2/checkpoints/Change1/`; `Part2/verification/`; `Part2/code/`                                                                                                 |
| AM.AI.U4AID23040 | Guduru Akshaya Giri | AI & DS    | **Part 2 — Room upgrade and evidence review:** review or implement Change 2, including availability checking, price-difference calculation, room reassignment, persistence, and its corresponding test/metric evidence.                                                                                                                 | `Part2/changes/Change2/`; `Part2/checkpoints/Change2/`; `Part2/metrics/`; `Part2/verification/`                                                                                              |
| AM.AI.U4AID23046 | Kurt Sony Rebello   | AI & DS    | **Architecture and LLM evidence; integration review:** maintain the source-baseline and architecture-analysis records; preserve the prompt/result evidence and verification notes; review the Change 3 cancellation Strategy and Part 3 evidence; coordinate consistency checks across the README, report, datasets, and final package. | `llm-analysis/prompts/`; `llm-analysis/results/`; `data/llm.csv`; `Part2/changes/Change3/`; `Part3/`; [ChatGPT conversation](https://chatgpt.com/share/6acb66c9-1850-83ee-b633-7a40980199f4) |

## Submission Structure

```text
A7/
├── README.md
├── A7_Report.pdf
├── A7_Report.tex
├── A7_slide.tex
├── data/
│   ├── code/                         # Original Rails application source at the fixed baseline
│   ├── test_result/                  # Test cases, screenshots, validation receipts and review evidence
│   ├── patterns.csv                  # Confirmed baseline pattern records
│   ├── pattern_counts.csv            # Baseline/evolution pattern counts
│   ├── patterns_evolution.csv         # Pattern records across Part 2 changes
│   ├── cross_language.csv             # Part 3 implementation and measurement records
│   ├── llm.csv                       # Central LLM activity/evidence index
│   └── baseline_source_manifest.json # Baseline source integrity manifest
├── Part1/                            # Baseline architecture and pattern discovery
├── Part2/                            # Evolved source, changes, checkpoints and metrics
│   ├── code/                         # Evolved Rails application source
│   ├── changes/                      # Change1–Change3 requirements, diffs and test results
│   ├── checkpoints/                  # Original and cumulative change snapshots
│   ├── diagrams/                     # UML sources and rendered diagrams
│   ├── metrics/                      # AST metrics and before/after tables
│   └── verification/                 # Test receipts and review evidence
├── Part3/                            # Template Method and Strategy examples in four languages
│   ├── template-method/
│   ├── strategy/
│   ├── evidence/
│   ├── test-cases/
│   └── llm/A7_slide.pdf              # Presentation PDF in the prescribed location
├── llm-analysis/                     # Shared prompts/results plus individual contribution evidence
│   ├── prompts/                      # Shared task prompts 01–07 (including recovered 02 and 03)
│   ├── results/                      # Corresponding retained analysis outputs/evaluations
│   ├── Kavya_Penikalapati_AM.AI.U4AID23016/
│   ├── E_Abhijith_Krishna_AM.AI.U4AID23037/
│   ├── Guduru_Akshaya_Giri_AM.AI.U4AID23040/
│   └── Kurt_Sony_Rebello_AM.AI.U4AID23046/
├── tools/                            # Validation and packaging scripts
├── SUBMISSION_CHECKLIST.md
├── MERGE_AUDIT.md
├── MASTER_HANDOFF.md
└── FINAL_TREE.txt
```

The tree is a guide to the main deliverables; individual evidence files may be nested beneath these directories. Keep the canonical CSV datasets in `data/` rather than copying duplicate versions into each part.

## Pattern Findings

- **Baseline (Part 1): Template Method — one confirmed collaboration.** `CrudConcern` (an `ActiveSupport::Concern` module) provides the common CRUD workflow (`index`, `show`, `new`, `create`, `edit`, `update`, and `destroy`). `BookingsController`, `RoomsController`, and `SettingsController` provide resource-specific hooks such as `base_class`, `object_class`, `model_params`, `strong_params`, and `use_slug?`.
- **Evolved application (Part 2): Strategy — introduced in Change 3.** `CancellationService` acts as the context and delegates refund calculation to a `CancellationPolicy` strategy family: `FlexibleCancellationPolicy` (100% refund), `PartialRefundCancellationPolicy` (50% refund within the configured window), and `NoRefundCancellationPolicy` (0% refund). The claim applies to the evolved implementation, not the original baseline.

Pattern labels are based on the recorded implementation and source evidence. Rails concerns, callbacks, and external integrations are not automatically counted as GoF patterns without evidence of the defining collaboration.

## Part 2 Incremental Evolution

1. **Change 1 — Additional services:** `AdditionalService`, `BreakfastPackage`, `AirportTransfer`, `BookingService`, and `AdditionalServicePricing` for service-pricing behavior.
2. **Change 2 — Room upgrade:** `RoomUpgrade` handles an availability query, price-difference computation, room reassignment, and persistence.
3. **Change 3 — Cancellation Strategy:** `CancellationService` delegates refund calculation to the `CancellationPolicy` strategy family.

The retained intermediate Change 1 and Change 2 snapshots are cumulative, reproducible pedagogical stages. They should not be described as historical upstream commits unless independent Git history proves that claim.

## Runtime and Verification Environment

- **Ruby:** 3.3.8 for current syntax checks; the upstream Gemfile records the older Ruby/Rails compatibility context (Ruby 2.7.5 and Rails approximately 7.0.4).
- **Java:** OpenJDK 21.0.11
- **Python:** 3.13.5
- **Node.js:** v22.16.0
- **C++:** g++ 14.2.0

## Measurement Rules

- **Lines of code (LOC):** Excludes blank lines and comments.
- **Complexity:** Cyclomatic complexity (McCabe count).
- **Execution timing:** Compile first, run one warm-up process, then five measured process runs; report the median. Timing includes process startup and execution. Raw receipts are retained in `Part3/evidence/`.

## LLM-Assisted Analysis and Conversation Evidence

The repository retains prompt/result records for the baseline investigation, architecture reconstruction, pattern discovery, evolution analysis, cross-language implementation, and final audit. Prompt 02 (architecture reconstruction) and Prompt 03 (pattern discovery) have now been recovered from the supplied original text and should be stored as the corresponding Markdown prompt files under `llm-analysis/prompts/`. The files should contain the recovered prompt text, not the earlier recovery-note placeholders.

Each student should also maintain a named folder under `llm-analysis/` containing their own genuine contribution evidence, such as their README or evidence index, prompts they actually used, supplied inputs, model outputs, verification notes, ChatGPT conversation link, and exported conversation PDF where required. Do not copy another student's conversation or attribute shared work to one individual without agreement. The named folders above indicate the intended organization; include them in the submission only after they contain the corresponding member's actual evidence.

The central `data/llm.csv` is the index of the project's LLM activities. It should point to the exact prompt, input, result, and verification files that are actually included in the final package. Historical model names/dates should remain marked unknown when the original record does not establish them; do not infer or invent metadata.

Kurt Sony Rebello's conversation evidence is available at this [ChatGPT share link](https://chatgpt.com/share/6acb66c9-1850-83ee-b633-7a40980199f4). The exported conversation PDF should be stored in the corresponding individual contribution-evidence folder in the final package. The share link is recorded here, so a separate `chat_link.txt` is not necessary unless requested by the instructor.

## Important Disclosures and Limitations

1. **Rails integration tests:** Historical Rails/RSpec receipts report cumulative results of 5/0, 13/0, 21/0, and 36/0 examples/failures from a dedicated PostgreSQL-backed container environment. The receipts are retained in `Part2/verification/`. Unless the full suite is rerun, these figures should be described as historical receipts, not as a fresh test run in the packaging environment.
2. **Prompt provenance:** Prompt 02 and Prompt 03 have been recovered and should replace the old recovery-note versions in the final archive. The LLM index and `llm-analysis/README.md` should be updated to remove any stale statement that these prompt texts are unrecoverable.
3. **Experiment 07:** This is recorded as a verification interaction with the GPT-6 family, with frozen inputs, hashes, outputs, and evaluation. Its metadata should be presented only as supported by the retained evidence.
4. **Contribution records:** The role allocation in the table above is a proposed, balanced draft—not an independently verified historical record. Confirm it with all four members and revise it wherever necessary before treating it as the team's final attribution. Make the report's Section 9.7 and this README agree.
5. **Baseline provenance:** The original application is pinned to the specified baseline commit. Use `data/baseline_source_manifest.json` and the validation tools to check that the packaged source matches the recorded manifest.

## Automated Verification

Run these commands from the `A7/` directory:

```bash
python tools/check_part2.py
python tools/check_csv.py
python tools/check_submission.py
python tools/check_submission.py --zip /path/to/A7_Final_Submission.zip
```

- `check_part2.py` reconstructs and verifies the cumulative checkpoints, manifests, patches, and metrics.
- `check_csv.py` checks CSV consistency and report source references.
- `check_submission.py` checks baseline source integrity, scans for likely secrets, and validates the final archive when a ZIP path is supplied.
