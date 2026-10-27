# DaPlanStan — Evolution to Cross-Language Analysis Handoff

*11 October 2026 | Source version to reference: `scenario3_cancellation_policies`*

## Evolution freeze

Treat the four source-version inventories as frozen source-level evidence. The original `DaPlanStan_Part2/patterns.csv` contains 9 baseline records, preserved verbatim. The new `patterns_evolution.csv` contains the full 9 + 10 + 12 + 14 = **45 versioned records**, with participants, paths, evidence, statuses and change descriptions. `pattern_counts.csv` contains counts derived from those records. Do not edit application source or reinterpret the frozen P01–P09 baseline for cross-language work.

## Final confirmed pattern types

| Pattern type | Final instances | Suggested selection rule (not yet selected) |
|---|---:|---|
| Controller (GRASP) | 9 | Choose one verified request coordination with clear inputs and delegated work |
| Information Expert (GRASP) | 1 | Examine P01's email-to-trip linking responsibilities |
| Observer (GoF) | 2 | Choose a source-verified notification collaboration and distinguish framework observers |
| Adapter (GoF) | 1 | Examine S2-N01: Atlas and Beacon normalizers as one collaboration |
| Strategy (GoF) | 1 | Examine S3-N01: Flexible/Moderate/Strict are one interchangeable policy collaboration |

These are the **five pattern types** available for representative selection. Do not select a representative simply to maximize metrics; choose after reviewing source evidence and feasibility of the same input/output problem in four languages.

## Faculty requirement — resolves team-division ambiguity

The uploaded **23CSE455 Design Pattern Case Study Instructions, page 2**, say: **“For each detected pattern type, implement its small problem in all four languages, using the same inputs and expected outputs.”** The languages are **Java, Python, JavaScript, C++**. The case-study report template also states one representative confirmed instance **for each pattern type**. Therefore the earlier assumption that only two selected patterns need cross-language analysis is **inconsistent with the supplied faculty instructions**. Plan for **5 representative problems × 4 languages = 20 implementations**, unless faculty explicitly grants a revised scope. This handoff deliberately does *not* select the five representatives or start snippets.

## What the cross-language teammate must receive

- `patterns_evolution.csv`, `pattern_counts.csv`, `evolution_status_matrix.csv`, `evolution_refactoring_report.md`.
- Frozen original baseline package and all three source snapshots with their version labels.
- Scenario 1/2/3 verification documents and focused test/standalone evidence.
- Source-level limitations: Ruby 3.3.8 is available, Ruby 3.4.2 is required and locked Rails 8.1.3 dependencies are unavailable; **Rails integration tests were not executed**.

## Cross-language measurement requirements to plan for

For each chosen type's representative collaboration, define one shared problem, fixed inputs, outputs, error cases and fixtures. Implement that **same** problem and pattern in Java, Python, JavaScript and C++, with separate production snippets and tests. The faculty `cross_language.csv` columns include `pattern_name`, `instance_name`, `language`, `snippet_path`, `source_loc`, `max_function_cc`, `runtime_compiler`, `test_command`, `test_result`, `median_process_ms`, and `language_notes`. Source LOC excludes blank lines/comments/tests; specify the cyclomatic-complexity counting rule and tool. For timing, compile first, perform one warm-up, then five measured process runs on the same machine; report the measured median, **never estimate missing time**. Record compiler/runtime versions, working directories, actual test results and raw timing logs.

## Submission coordination

Do not produce cross-language source code at this handoff stage. Preserve the baseline package; add final evolution CSVs only once in the team submission's designated dataset area. Use the exact filename `patterns_evolution.csv` (not `pattern_evalution.csv`, which appears as a typo in one hierarchy example). The original frozen `patterns.csv` should remain archived as baseline; the optional `patterns_multiversion_candidate.csv` is a separate seven-column candidate for any team-root multi-version `patterns.csv` requirement and must be human-reviewed before renaming or submission. Obtain actual Rails regression results and faculty/team scope confirmation before final claims of testing completeness.
