# Digital Wallet Case Study — Review Output

**Study:** Design Pattern Identification and Evolution in a Quarkus-Based Digital Wallet  
**Team:** B9  
**Basis of this review:** `prompt.txt` and the supplied `B9_Report.pdf`.

## Scope and evidence limitation

This is a **report-based preliminary review**, not a complete source-code audit. The report describes source snapshots, tests, diagrams, evidence logs, CSV files, an Excel workbook, and LLM records, but those underlying artifacts were not available in the files supplied for this review. Therefore, statements below are identified as **reported** rather than independently verified wherever appropriate. No source line numbers, test outcomes, CSV calculations, or timing measurements have been independently reproduced.

## A. Understand the wallet design

### Reported application architecture

The report describes a Java 17, Quarkus 3.40.1 application using Maven and an in-memory repository model. Its stated scope includes wallet transfers, transfer lifecycle handling, persistence boundaries, transaction notifications, money/currency representation, and the three evolution changes described below.

The baseline pattern inventory suggests the following responsibilities:

- **Facade:** presents a wallet-transfer application boundary.
- **Repository:** isolates wallet persistence operations.
- **Builder:** constructs transfer records in the baseline.
- **Observer:** publishes transaction notifications.
- **State:** represents transfer lifecycle states.
- **Command:** encapsulates transfer execution.
- **Value Object:** represents a money amount and currency.

The report says the first evolution adds currency conversion, the second adds transaction-limit rules, and the third adds fraud-screening checks.

**Not independently confirmed:** request-to-operation call paths, actual persistence semantics, beneficiary handling, authentication/authorization, security controls, and whether every diagrammed component is implemented. The source tree and relevant classes are required to verify these details. An in-memory repository should not be described as durable database persistence without evidence.

## B. Find patterns with evidence

The report's baseline catalog contains seven pattern instances:

| Reported pattern | Reported role | Classification |
|---|---|---|
| Builder | Transfer record construction | GoF creational pattern |
| Facade | Wallet transfer application boundary | GoF structural pattern |
| Repository | Wallet persistence boundary | Architectural/data-access pattern |
| Observer | Transaction notification | GoF behavioral pattern |
| State | Transfer lifecycle | GoF behavioral pattern |
| Command | Transfer execution | GoF behavioral pattern |
| Value Object | Money amount and currency | Domain modeling practice; not a GoF pattern |

The report also says Strategy and Chain of Responsibility were rejected as baseline candidates. It reports 7 distinct pattern types, 7 instances, 18 concrete participant-role mappings, 14 unique mapped symbols, and 2 rejected candidates.

These classifications are plausible based on the reported responsibilities, but **the source-level evidence has not been checked**. Class names alone are insufficient to prove a pattern. To finalize this inventory, inspect the relevant source classes and method calls, then record file paths, current line numbers, confidence, and alternative interpretations. Keep the distinction between pattern instances, pattern categories, participant-role mappings, and unique symbols.

## C. Reconcile inventory files

The report says the project contains:

- `data/patterns.csv`
- `data/pattern_counts.csv`
- `data/patterns_evolution.csv`

**Status: impossible to determine from the supplied artifacts.** The CSV rows were not available for comparison, so row-level mismatches, path validity, duplicate intent, and category/instance totals cannot be confirmed.

Recommended validation:
1. Compare every pattern row to a real source location and concrete implementation evidence.
2. Recalculate distinct pattern categories separately from pattern instances and participant-role mappings.
3. Confirm all recorded paths resolve relative to the submitted project root.
4. Identify repeated entries and document whether they represent distinct instances or accidental duplication.
5. Preserve original observations and record proposed corrections separately.

## D. Trace the diagrams

The report says architecture diagrams and UML evidence are part of the submission. The editable PlantUML files and rendered images were not available for this review.

**Status: included according to the report, but requiring validation.** Class membership, dependencies, message flow, labels, and alignment with source declarations cannot be checked here. Compare each `.puml` against the source snapshot it is intended to represent. Keep conceptual components visibly distinct from implemented components, and state whether the rendered image was actually inspected.

## E. Follow each change through the system

The report describes three changes:

| Change | Reported addition/refactoring | Reported metrics after change* |
|---|---|---|
| CH01 — Multi-currency | `CurrencyConversionStrategy`, `SameCurrencyConversion`, `FixedRateConversion`, `CurrencyStrategyFactory`, `VendorFxAdapter`; Strategy, Simple Factory, Adapter, and CDI are discussed. The report says the baseline Builder is replaced by an immutable record constructor. | 142 production LOC; 25 test LOC; 1/1 tests |
| CH02 — Transaction limits | `TransactionLimitPolicy`, `PerTransferLimit`, `DailyLimitDecorator`; per-transfer and daily aggregate limits are described, with a daily cap of EUR 1,000. | 160 production LOC; 38 test LOC; 2/2 tests |
| CH03 — Fraud screening | `FraudCheckChain`, `DenyListCheck`, `VelocityCheck`; the intended behavior is to stop on the first failed check. | 180 production LOC; 57 test LOC; 4/4 tests |

\*These values are **reported by the PDF and not independently reproduced**.

### CH01 — Multi-currency support

The report describes a strategy interface with same-currency and fixed-rate implementations, a factory, and a vendor adapter. It gives the example USD 10 at a fixed rate of 0.92 producing EUR 9.20, while EUR 10 remains EUR 10. These are reported fixtures, not evidence of a live foreign-exchange service. Confirm unsupported currency-pair behavior and verify that the conversion is applied before transfer execution and wallet mutation.

### CH02 — Transaction limits

The report describes a per-transfer limit and a daily aggregate limit of EUR 1,000. Source and test evidence are needed to establish how daily usage is calculated, whether it persists across sessions/days, how concurrent transfers are handled, and whether a rejected transfer leaves wallet balances unchanged. Do not infer these properties from the class names.

### CH03 — Fraud screening

The report describes a chain containing deny-list and velocity checks, with the first failure rejecting the transfer. Verify the actual order of checks, how a failed check is represented, whether all required checks run, and whether rejection occurs before any wallet mutation or notification.

### Evolution metrics

The report gives the following baseline-to-final progression:

| Stage | Production LOC | Test LOC | Tests passed / reported total | Pattern types | Instances | Participant-role mappings |
|---|---:|---:|---:|---:|---:|---:|
| Baseline | 92 | 0 | 0/0 | 7 | 7 | 18 |
| After CH01 | 142 | 25 | 1/1 | 11 | 14 | 26 |
| After CH02 | 160 | 38 | 2/2 | 12 | 16 | 29 |
| After CH03 | 180 | 57 | 4/4 | 13 | 17 | 33 |

The values above are report claims. The supplied package for this review did not include the intermediate snapshots, patches, source trees, or actual test logs needed to reproduce them. Also, “0/0 tests” means no tests are reported for the baseline; it should not be presented as a successful test run.

## F. Examine the multi-language examples

The prompt requests **Repository and Strategy** demonstrations in Java, Python, JavaScript, and C++. The B9 report summary available for this review describes **Strategy and Observer** demonstrations instead. This is a material scope discrepancy that must be resolved against the actual Part3 source files and assignment requirements before submission.

The report records the following runtime/compiler versions: OpenJDK 17, Python 3.12.14, Node.js v24.19.0, and G++ 13.3.0 with C++17. It reports Strategy and Observer fixtures, including USD 10 at rate 0.92 → EUR 9.20, same-currency EUR 10 unchanged, and observer event order `email:t1`, `audit:t1`. It also reports four passing tests per language-pattern pair.

The report's timing table gives these values:

| Pattern | Language | LOC | CC | Reported timing |
|---|---|---:|---:|---:|
| Strategy | Java | 23 | 2 | 81.6 ms |
| Strategy | Python | 30 | 2 | 93.29 ms |
| Strategy | JavaScript | 15 | 2 | 63.37 ms |
| Strategy | C++ | 27 | 2 | 72.8 ms |
| Observer | Java | 23 | 2 | 67.9 ms |
| Observer | Python | 30 | 2 | 93.29 ms |
| Observer | JavaScript | 15 | 2 | 63.37 ms |
| Observer | C++ | 27 | 2 | 76.2 ms |

These are **reported values only**. The source code, process timing log, exact run-level samples, and calculation steps were not supplied here. The report says timings include process startup and fixtures, with compilation performed first, one warm-up, and five measured runs. That protocol and the reported medians should be checked against `Part3/evidence/process_timing.txt`. Do not interpret this small example as a general language-performance ranking.

## G. Check the model-assisted analysis record

The report says LLM prompts and human verification are included. The actual `data/llm.csv` and prompt/output artifacts were not available in this review, so it is not possible to establish which records are reusable prompts, response summaries, or original model interactions.

For the final audit:
- Preserve the original predicted label and human-reviewed label.
- Calculate agreement from the actual rows, not from a narrative summary.
- Inspect disagreements against source evidence.
- Record model/version/date/reviewer metadata only when present.
- Do not describe a refined prompt as verbatim or a response summary as a raw model response.

## H. Validate the research data files

The report says a master workbook exists at `data/B9_Digital_Wallet_Dataset.xlsx` and mirrors the CSV datasets. The workbook and CSV files were not available for inspection in this review.

**Status: impossible to determine from the supplied artifacts.** CSV columns and row totals, workbook sheet names, formulas, cached formula values, and CSV/workbook agreement have not been checked. File presence alone would not prove the data or application behavior is correct.

## I. Assess the report against the brief

Based on the PDF's table of contents and claims, the report includes sections for application architecture, Part 1 pattern discovery, Part 2 evolution, Part 3 cross-language analysis, LLM records, datasets, limitations, and submission readiness.

| Deliverable | Current assessment |
|---|---|
| Application and architecture description | Included in report; source alignment requires validation |
| Pattern inventory and mapping | Included in report; code evidence not independently checked |
| UML/PlantUML diagrams | Report says included; diagram files not inspected |
| Three evolution scenarios | Included in report; patches/source/tests not inspected |
| Before/after metrics and refactoring discussion | Included in report; metrics not reproduced |
| Four-language examples | Report describes four languages, but pattern scope discrepancy (Strategy/Observer vs Repository/Strategy) needs resolution |
| LLM analysis and human verification | Report says included; underlying records not inspected |
| CSV datasets and Excel workbook | Report says included; data reconciliation not performed |
| Test and timing evidence | Report says evidence exists; logs not inspected |
| Team/submission information | Team and submission status are printed in the PDF; other administrative requirements should be checked against the official brief |

## J. Trustworthy handoff and prioritized next actions

### What can be said now

- The report presents a coherent intended narrative: identify baseline patterns, evolve the wallet through currency conversion, transaction limits, and fraud screening, then compare selected pattern examples across languages.
- The report records specific source identities, class names, metrics, fixtures, and environment versions.
- These details are **report-derived claims**, not independently verified implementation results in this review.

### Highest-priority actions

1. **Resolve the Part3 pattern mismatch.** The review prompt asks for Repository and Strategy, while the report describes Strategy and Observer. Check the assignment brief and actual source files; update the report or prompt only after determining which is correct.
2. **Run the source/test audit.** Inspect baseline and evolved source trees, patches, and actual test logs. Verify rejection-before-mutation behavior for limit and fraud failures.
3. **Reconcile the datasets.** Open all CSV files and the Excel workbook, recompute counts and agreement, validate paths, and document any mismatches without overwriting original observations.
4. **Verify the diagrams.** Compare each editable PlantUML file with source declarations and calls, then note whether rendered images were inspected.
5. **Reproduce timing claims.** Inspect raw run logs and verify units, startup inclusion, warm-up, number of runs, median calculation, LOC, and complexity methodology.
6. **Audit LLM provenance.** Separate prompts, summaries, and raw responses; calculate agreement from actual rows; identify missing metadata.
7. **Update the submission status.** Claim that the package is verified or complete only after the relevant source, evidence, datasets, and deliverables have passed these checks.

## Overall assessment

**Preliminary status: report present; full package verification incomplete.** The PDF documents a substantial intended case study, but the available materials for this review do not support a definitive claim that every implementation, metric, dataset, diagram, test, and LLM record has been independently validated. The next step is to run the checks above against the actual project package and preserve the resulting evidence.
