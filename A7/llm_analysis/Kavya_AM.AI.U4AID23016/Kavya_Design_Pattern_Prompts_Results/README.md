# Design Pattern Analysis and Evolution in a Ruby on Rails Hotel Booking Application

**Artifact:** LLM prompts and results bundle  
**Prepared for:** Design Pattern Case Study  
**Project focus:** Reverse-engineering an existing Rails hotel-booking application, evaluating its design patterns, evolving the application for new requirements, and comparing selected patterns across four programming languages.

## 1. Purpose

This folder organizes the case-study prompts and their corresponding results in a reproducible, easy-to-review format. It follows the reference archive's separate `prompts/` and `results/` folders and contains **14 prompt files and 14 matching result files**.

The work is intended to support the main case-study submission. It is not a replacement for the report, source code, CSV evidence, diagrams, test receipts, or other deliverables required by the assignment.

## 2. Public conversation reference

The public ChatGPT conversation supplied for this work is available here:

[Open the public ChatGPT conversation](https://chatgpt.com/share/6aca5e0a-6d74-83e8-8abd-c51a7e46a929)

The link is provided as a reference. If it is unavailable or does not expose the complete conversation, use the prompt/result files in this archive and the project artifacts as the available record.

## 3. Folder structure

```text
Kavya_Design_Pattern_Prompts_Results/
├── README.md
├── Design Patterns Case Study.pdf
├── prompts/
│   ├── prompt-01-baseline.md
│   ├── ...
│   └── prompt-14-final-package-audit.md
└── results/
    ├── result-01-baseline.md
    ├── ...
    └── result-14-final-package-audit.md
```

Every prompt is paired with a result using the same two-digit number. For example, `prompt-04-evolution.md` corresponds to `result-04-evolution.md`.

## 4. Prompt and result index

| No. | Stage | Prompt file | Matching result file |
|---:|---|---|---|
| 01 | Baseline analysis and repository discovery | `prompts/prompt-01-baseline.md` | `results/result-01-baseline.md` |
| 02 | Application architecture | `prompts/prompt-02-architecture.md` | `results/result-02-architecture.md` |
| 03 | Pattern discovery and source evidence | `prompts/prompt-03-pattern-discovery.md` | `results/result-03-pattern-discovery.md` |
| 04 | Application evolution and change analysis | `prompts/prompt-04-evolution.md` | `results/result-04-evolution.md` |
| 05 | Cross-language pattern implementation | `prompts/prompt-05-cross-language.md` | `results/result-05-cross-language.md` |
| 06 | Final audit of retained analysis artifacts | `prompts/prompt-06-final-audit.md` | `results/result-06-final-audit.md` |
| 07 | Change 1 — additional services | `prompts/prompt-07-change-1-additional-services.md` | `results/result-07-change-1-additional-services.md` |
| 08 | Change 2 — room upgrade | `prompts/prompt-08-change-2-room-upgrade.md` | `results/result-08-change-2-room-upgrade.md` |
| 09 | Change 3 — cancellation Strategy | `prompts/prompt-09-change-3-cancellation-strategy.md` | `results/result-09-change-3-cancellation-strategy.md` |
| 10 | Pattern evolution matrix | `prompts/prompt-10-evolution-matrix.md` | `results/result-10-evolution-matrix.md` |
| 11 | Pattern selection and justification | `prompts/prompt-11-pattern-selection.md` | `results/result-11-pattern-selection.md` |
| 12 | Four-language implementation | `prompts/prompt-12-four-language-implementation.md` | `results/result-12-four-language-implementation.md` |
| 13 | Testing, timing, and metrics | `prompts/prompt-13-test-and-metrics.md` | `results/result-13-test-and-metrics.md` |
| 14 | Final package and reproducibility audit | `prompts/prompt-14-final-package-audit.md` | `results/result-14-final-package-audit.md` |

## 5. Case-study scope

The project examines an existing Ruby on Rails hotel-booking application and considers these evolution requirements:

1. Breakfast packages and airport transfers as additional services.
2. Room upgrades, including availability and price differences.
3. Configurable cancellation policies and refund behavior.

The baseline source analysis identifies four evidence-backed collaborations: one Template Method collaboration, one GRASP Controller collaboration, and two GRASP Information Expert collaborations. The cancellation-policy evolution introduces one Strategy collaboration, giving five recorded collaborations across four pattern types in the evolved analysis. Pattern identification should always be checked against the source locations and evidence recorded in the main submission.

The four-language examples demonstrate selected pattern concepts in Java, Python, JavaScript, and C++. Their results and timings should be interpreted according to the recorded test commands and measurement methodology, not as universal performance comparisons.

## 6. Record integrity and interpretation

- **Prompts/results 01–06:** contain the detailed analysis records retained with the submission materials. A retained file may explicitly state when an exact historical prompt or model/date detail could not be recovered.
- **Prompts/results 07–14:** are structured, project-specific reconstructions based on available source files, change artifacts, CSVs, and test records. They are **not represented as verbatim historical chat messages**.
- Do not infer an exact model name, interaction date, or original chat wording unless it is supported by an original record.
- A described requirement or proposed change is not, by itself, proof that the application was fully implemented or integration-tested.
- Results should be cross-checked against the source code, CSV evidence, diagrams, test receipts, and final report in the main submission.

## 7. Known validation limits and remaining checks

The available packaging evidence records that full Rails/RSpec integration tests were **not run** in the packaging environment. Before final academic submission:

1. Confirm student, team, roll-number, and batch details wherever required.
2. Review the merged Part 2 source snapshot against the intended three changes.
3. Run the Rails/RSpec test suite in a correctly configured environment, if required by the assignment, and retain the actual output.
4. Add original LLM transcripts or exact model/date metadata only if those records are available and the instructor requires them.
5. Ensure every claim in the report is supported by the submitted source and evidence.

## 8. How to use this archive

1. Read the assignment PDF first to understand the deliverables and evaluation criteria.
2. Read prompts and results in numeric order; keep each prompt paired with its same-numbered result.
3. Use the result files as an index to the analysis, then verify technical claims against the actual project artifacts.
4. Treat the final audit files as a checklist of outstanding verification work, not as a claim that every external or integration test has passed.
5. Keep this prompt/result bundle together with the main project submission so reviewers can follow the reasoning trail.

## 9. Included files

- `Design Patterns Case Study.pdf` — assignment brief supplied with the archive.
- `prompts/` — 14 numbered prompt records.
- `results/` — 14 matching result records.
- `README.md` — this index, usage guide, and limitations statement.

---

**Evidence principle:** source-backed findings, reconstructed records, proposed changes, and executed tests must remain distinguishable. Do not present missing historical records or unrun tests as verified facts.
