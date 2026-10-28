# Design Patterns Case Study — Response and Results Record

## Purpose and provenance

This Markdown file records the key outputs and verified results from the Design Patterns case-study workflow. It is a curated summary of the responses and results visible in the conversation context, **not a verbatim export of every assistant response**. For submission, retain the actual raw prompts, raw model outputs, source files, and logs where the assignment requires them. Do not present this summary as a raw transcript.

## Project

**Title:** Design Pattern Identification and Evolution in a Quarkus-Based Digital Wallet Application

**Application:** Quarkus fund-transfer service  
**Quarkus version shown in test output:** 3.15.1  
**Java target shown in Maven output:** Java 17

## Output 1 — Part 1 pattern inventory

The reported inventory contains **6 pattern/categories and 15 instances**:

| Pattern/category | Instances |
|---|---:|
| Repository | 5 |
| Service Layer | 6 |
| Chain of Responsibility | 1 |
| Exception Mapper | 1 |
| Pessimistic Locking | 1 |
| Observer | 1 |
| **Total** | **15** |

Interpretation notes:
- “6 categories” means six distinct labels; “15 instances” is the total number of identified instances across those labels.
- The report should not call all six classic Gang of Four patterns. Service Layer is an architectural pattern; Pessimistic Locking is a concurrency technique; Exception Mapper and Filter/Chain-of-Responsibility classifications may be framework-related and should be explained based on implementation evidence.
- Source-level evidence and line references must be checked against the submitted source files before final publication.

## Output 2 — Part 1 diagram set

Eight PlantUML source files were supplied:

1. `01_architecture.puml`
2. `02_sequence_transfer.puml`
3. `03_uml_chain_of_responsibility.puml`
4. `04_uml_repository.puml`
5. `05_uml_exception_mapper.puml`
6. `06_uml_pessimistic_locking.puml`
7. `07_uml_service_layer.puml`
8. `08_uml_observer.puml`

A rendered architecture image was available. The presence of all seven other rendered PNGs was **not confirmed** in the latest status. Check that each `.puml` has a corresponding readable `.png` if rendered diagrams are required.

## Output 3 — Part 2 feature evolution

The three feature changes were described as:

1. **Multi-currency:** Adds currency fields and an `ExchangeRateProvider` abstraction with a `FixedExchangeRateProvider`. The documented rates are fixed demo rates, not live exchange rates.
2. **Transaction limits:** Adds transaction amount limits and corresponding rejection behavior.
3. **Fraud detection:** Adds a `FraudDetectionStrategy` abstraction and a `RuleBasedFraudDetectionStrategy`. The documented demo threshold is 750.00.

The independent Change 2 suite had a test adjustment during troubleshooting. The final report should disclose test modifications and avoid implying that the original independent test suite was unchanged. The integrated application’s later test results are recorded separately below.

## Output 4 — Latest integrated test result

The user ran `.\scripts\verify_all.ps1` from:

`C:\Users\VISHNU\Desktop\Design_Patterns_Case_Study_Team_Package`

The pasted Maven output reports:

```text
Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
-- FundTransferIntegrationTest

Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
-- FixedExchangeRateProviderTest

Tests run: 14, Failures: 0, Errors: 0, Skipped: 0

BUILD SUCCESS
Total time: 30.202 s
Finished at: 2026-10-11T14:53:18+05:30
```

The logs include examples of:
- Successful transfers and merchant payments
- Fraud-screening rejection with code `FT-TXN-006`
- Insufficient-funds rejection with code `FT-TXN-002`
- Transaction-limit rejection with code `FT-TXN-005`

**Conclusion supported by this log:** the integrated Maven test suite passed 14 tests with no failures, errors, or skips in this run. This does not by itself prove that all report, diagram, or submission requirements are complete.

## Output 5 — Latest cross-language verification result

The same verification run reports:

```text
=== Part 3: cross-language fixture and benchmark checks ===
Wrote C:\Users\VISHNU\Desktop\Design_Patterns_Case_Study_Team_Package\Part3\cross-language\results\cross_language.csv
Programs checked: 8; output matches: 8/8
Median times are local measurements and include process startup.
Cyclomatic complexity values are documented manual counts; verify them against the submitted source before reporting.
=== Finished: inspect both logs in test-results ===
```

**Conclusion supported by this output:** all eight checked programs matched their expected fixture outputs in that run.

Limitations:
- The reported median times include process startup and should not be treated as a clean language-performance ranking without methodological caveats.
- Cyclomatic complexity values are documented manual counts and should be verified against the exact submitted source.

## Output 6 — LLM evaluation record

The project summary records 10 rows in `llm.csv` and a reported exact-match result of **9/10 (90%)**. One noted disagreement concerns `DataSeeder.java`, for which the prediction was `None/Insufficient Evidence` while the manual review labels it Observer based on `@Observes StartupEvent`. Another row has a possible taxonomy mapping issue between `Filter/Interceptor` and `Chain of Responsibility`.

Before submission:
- Confirm the accuracy calculation against the actual CSV.
- Preserve actual model output and prompt records.
- Fill in the actual model name/tier/date from the session if required and available.
- Explain taxonomy mappings and disagreements rather than silently changing labels.

## Output 7 — Submission-readiness status

### Confirmed from the recorded run
- Integrated Maven tests: **14/14 passed**.
- Cross-language fixture checks: **8/8 matched**.
- Eight PlantUML source filenames were supplied.
- The reported Part 1 inventory contains six categories and 15 instances.

### Still requires a file/folder check
- Whether all eight diagrams have rendered PNGs.
- Whether all required CSVs, raw prompts, raw model outputs, logs, and source evidence are present in the final package.
- Whether the report includes complete team/student details, source/repository references, and actual model metadata.
- Whether all claims and counts in the report match the files actually being submitted.

## Final interpretation

The latest verification output is positive for the application tests and cross-language fixture checks. It is not enough on its own to certify the entire academic submission as complete. Complete the evidence and documentation checklist, and keep the raw files/logs alongside this summary.
