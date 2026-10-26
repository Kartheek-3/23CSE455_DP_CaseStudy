# B9 Digital Wallet — End-to-End Technical Review
## Prepared for Shashank | Whole-project review draft

> **Provenance and scope:** This document is a structured review draft based on the supplied B9 final report. It is not a raw response from a separate model run, and it does not independently inspect source snapshots, CSVs, or logs unless those artifacts are supplied and examined. Numerical results below are described as *reported by the report* and should be reconciled against the project files before being presented as independently verified.

## 1. Executive assessment

The B9 case study is organized around three connected activities: baseline pattern discovery, evolution of the wallet application through three changes, and cross-language demonstrations of two patterns. The report describes a baseline with seven pattern instances and a final evolved system with 13 distinct pattern types and 17 instances.

The report also states that the evolved Java production source contains 180 physical LOC, that the cross-language examples pass 4/4 fixture checks per implementation, and that Java, Python, JavaScript (Node.js), and C++ are represented. These are report-level claims until checked against the exact submitted files and logs.

The strongest design argument in the report is that currency conversion, limit enforcement, and fraud screening are moved into separate collaborations rather than accumulating as conditional logic in the central transfer workflow. The main verification risks are whether the source and datasets agree with the narrative, whether limit state is actually maintained correctly, whether fraud screening precedes balance mutation, and whether benchmark numbers can be reproduced.

## 2. Application identity and architecture

### 2.1 Application description

The report describes a lightweight digital wallet reference application using Java 17 and Quarkus 3.40.1, with Maven 3.9+ and an in-memory repository model. The baseline snapshot is named `baseline-local-2026-10-11`; the cumulative evolved snapshot is named `evolved-local-2026-10-11`.

The functional scope listed in the report includes wallet management, beneficiary management, currency conversion, transaction limits, fraud screening, notifications, and REST request/response handling.

### 2.2 Reported request flow

**Baseline flow described by the report**

1. An application caller invokes `WalletFacade`.
2. The facade retrieves sender and receiver wallets through `WalletRepository`.
3. It constructs and executes `TransferCommand`.
4. The command debits the sender, credits the receiver, and creates a transaction record.
5. `NotificationPublisher` broadcasts transfer completion to registered observers.

**Evolved flow described by the report**

1. An HTTP request reaches `WalletResource`.
2. The resource delegates to CDI-managed `WalletService`.
3. The service coordinates currency conversion, limit validation and fraud checks.
4. When checks pass, wallet state and transaction data are updated.
5. Completion notifications are published.

The exact order of all evolved operations should be checked in the service source. In particular, limit and fraud rejection must occur before balance mutation to satisfy the documented safety requirements.

### 2.3 Architecture evidence to confirm

The report identifies editable PlantUML files for the baseline and evolved architectures. Verify that the rendered diagrams exist and that each dependency, call and pattern participant corresponds to actual source. The report alone cannot establish that every diagram is current.

## 3. Part 1 — Baseline pattern discovery

### 3.1 Reported inventory

The report lists the following seven baseline collaborations:

| Pattern | Instance name | Roles described in the report |
|---|---|---|
| Builder | Transfer Record Construction | `Transaction.Builder`, `Transaction` |
| Facade | Wallet Transfer Application Boundary | `WalletFacade` and its repository, command and notification collaborators |
| Repository | Wallet Persistence Boundary | `WalletRepository`, `Wallet` |
| Observer | Transaction Notification | `NotificationPublisher`, `TransactionObserver`, `EmailNotifier`, `AuditNotifier` |
| State | Transfer Lifecycle | `TransactionState`, `PendingState`, `CompletedState` |
| Command | Transfer Execution | `TransferCommand`, `Wallet`, `WalletFacade` |
| Value Object | Money Amount and Currency | Immutable `Money` record |

The report counts seven distinct pattern types and seven instances, with 18 concrete participant-class role mappings and 14 unique mapped symbols. It rejects Strategy and Chain of Responsibility at baseline because it reports no interchangeable algorithm family and no sequence of independent filter handlers.

These counts and role mappings should be reproduced from `Part1/code/digital-wallet` and reconciled with `patterns.csv` and `pattern_counts.csv`. The count of role mappings is not necessarily the same as the count of unique classes because a class may participate in more than one role or collaboration.

### 3.2 Evidence standard

A pattern should be confirmed only when the source demonstrates the collaboration. For example:
- Builder requires construction to be staged through a builder abstraction and then produce the target object.
- Facade requires a simplified entry point coordinating multiple underlying operations.
- Repository requires a persistence boundary that exposes domain-oriented access rather than leaking storage details.
- Observer requires registration/subscription and notification to multiple observers.
- State requires behavior or transitions to be delegated to state objects.
- Command requires an operation to be represented as an executable request object.
- Value Object requires value-oriented semantics, usually immutability and domain-consistent equality/operations.

If source does not support a role or behavior, record the candidate as uncertain or rejected and explain why. Do not treat the report's label as sufficient proof.

## 4. Part 2 — Evolution and refactoring

### 4.1 CH01: Multi-currency support

**Requirement reported:** Support source currencies that settle in EUR. The report gives EUR 10.00 → EUR 10.00 and USD 10.00 → EUR 9.20 at a fixed demonstration rate of 0.92, with unsupported pairs rejected.

**Design described:** `CurrencyConversionStrategy` separates conversion algorithms; `SameCurrencyConversion` handles identical currencies; `FixedRateConversion` applies a configured rate; `CurrencyStrategyFactory` selects a strategy; and `VendorFxAdapter` translates provider quote formats.

**Reported pattern effects:** Strategy, Simple Factory, Adapter and CDI dependency injection are introduced. The report also says `Transaction.Builder` is replaced by an immutable record constructor.

**Verification required:**
- Check the strategy contract, selection logic and adapter mapping in source.
- Run the stated conversion fixtures and inspect the actual output.
- Check unsupported pairs, decimal precision and rounding.
- Confirm all callers were migrated if Builder was removed.
- Treat the rate as a fixed demonstration rate, not a live market rate.

### 4.2 CH02: Transaction limits

**Requirement reported:** Enforce a EUR 1,000 per-transfer cap and a EUR 1,000 daily aggregate ceiling. The report gives examples in which EUR 900 passes, EUR 1,001 fails, and a further EUR 300 after EUR 800 of daily usage fails.

**Design described:** `TransactionLimitPolicy` defines the validation contract. `PerTransferLimit` checks an individual transfer; `DailyLimitDecorator` delegates to the base policy and then checks the daily aggregate.

**Reported pattern effects:** Decorator is introduced and Strategy is extended.

**Verification required:**
- Confirm boundary behavior at, below and above each limit.
- Trace the caller to see how `dailyUsed` is computed.
- Establish whether usage is persisted, reset per day and protected from concurrent transfers.
- Confirm a rejected transfer does not change either wallet or record a completed transaction.
- Review any modified test cases and retain both the original and final test evidence where relevant.

Passing a `dailyUsed` value into a policy does not, by itself, demonstrate a complete rolling daily-limit implementation.

### 4.3 CH03: Fraud detection

**Requirement reported:** Screen transfers for deny-listed beneficiaries and high-velocity amounts before account mutation. The first failing check should reject the transfer.

**Design described:** `FraudCheckChain` coordinates `DenyListCheck` and `VelocityCheck` through a common `FraudCheck` contract, returning the first rejection reason.

**Reported pattern effect:** Chain of Responsibility is introduced.

**Verification required:**
- Confirm the chain order and short-circuit behavior.
- Trace the service call sequence to prove checks occur before debit/credit.
- Test deny-listed, high-velocity, ordinary and multiple-failure cases.
- Compare balances and transaction records before and after rejected attempts.
- Document that these are educational rules, not evidence of a production-grade fraud platform.

### 4.4 Reported before/after metrics

| Snapshot | Production LOC | Test LOC | Tests reported | Pattern types | Pattern instances | Concrete role mappings |
|---|---:|---:|---:|---:|---:|---:|
| Baseline | 92 | 0 | 0/0 | 7 | 7 | 18 |
| After CH01 | 142 | 25 | 1/1 | 11 | 14 | 26 |
| After CH02 | 160 | 38 | 2/2 | 12 | 16 | 29 |
| After CH03 | 180 | 57 | 4/4 | 13 | 17 | 33 |

**Status:** Values above are transcribed from the report. Recalculate them from the exact source snapshots and test logs using one consistent LOC and counting method. A higher pattern count or larger codebase does not automatically prove better design; the relevant question is whether responsibilities are more isolated and the new requirements are tested correctly.

## 5. Part 3 — Cross-language analysis

### 5.1 Common problems described in the report

**Strategy fixture**
- USD 10.00 at a fixed 0.92 rate produces EUR 9.20.
- EUR 10.00 converted to EUR remains EUR 10.00.
- Strategy selection follows the currency pair, where implemented.

**Observer fixture**
- Transfer ID `t1` is delivered to email and audit observers.
- Expected event order: `email:t1`, then `audit:t1`.

The report says both patterns are represented in Java, Python, JavaScript and C++, for eight implementations in total.

### 5.2 Reported benchmark table

| Pattern | Language | LOC | Max CC | Median process time (ms) | Reported result |
|---|---|---:|---:|---:|---|
| Strategy | Java | 23 | 2 | 81.6 | 4/4 |
| Strategy | Python | 30 | 2 | 93.29 | 4/4 |
| Strategy | JavaScript | 15 | 2 | 63.37 | 4/4 |
| Strategy | C++ | 27 | 2 | 72.8 | 4/4 |
| Observer | Java | 23 | 2 | 67.9 | 4/4 |
| Observer | Python | 30 | 2 | 93.29 | 4/4 |
| Observer | JavaScript | 15 | 2 | 63.37 | 4/4 |
| Observer | C++ | 27 | 2 | 76.2 | 4/4 |

The report states that timings include process startup and fixture execution, with one warm-up and five measured process runs. It names OpenJDK 17, Python 3.12.14, Node.js v24.19.0 and G++ 13.3.0/C++17.

These figures must be checked against `cross_language.csv`, the raw timing evidence and the actual implementations. In particular:
- Do not infer raw timing samples from a median.
- Confirm the measurement protocol was identical across languages.
- Verify that LOC excludes blank lines, comments and tests.
- Document how manual cyclomatic-complexity counts were calculated.
- Do not use process-startup timings as a general ranking of language performance.

### 5.3 Functional equivalence questions

For every language/pattern pair, verify the same inputs and outputs. Check conversion precision, invalid input handling, strategy selection, listener registration, notification order and exception behavior. A matching 4/4 test count is useful but does not prove the fixtures or edge cases are identical unless the actual test data is compared.

## 6. LLM records and human verification

The report says prompts and verification files are indexed in `data/llm.csv`, with team members assigned to baseline discovery, CH01, CH02/CH03, and cross-language work.

Review the actual LLM records to confirm:
- Exact prompt path and supplied input path.
- Raw model output file, displayed model and actual interaction date.
- Evaluation category and the evidence supporting it.
- Human reviewer notes and any correction to model claims.

Do not present a curated summary as a raw model response. If a prompt or raw output is missing, mark it as missing rather than reconstructing a conversation and claiming it was the original experiment.

## 7. Dataset and consistency audit

The report identifies `patterns.csv`, `pattern_counts.csv`, `patterns_evolution.csv`, `cross_language.csv`, `llm.csv` and `B9_Digital_Wallet_Dataset.xlsx`.

The following checks remain necessary unless actual files have been inspected:
- Baseline counts must agree with baseline source.
- Evolution rows must agree with each snapshot and retain stable names for continuing collaborations.
- Cross-language results must agree with source, fixture outputs, commands and timing logs.
- LLM records must link to real prompts and outputs.
- Excel sheets must match the authoritative CSV values.
- README paths, source-version labels, status values and CSV headers must follow the assignment specification.
- Reported test and metric totals must not conflict with the logs.

The official assignment instructions and the report's folder description should be checked together to ensure all required files are included in the final B9 folder.

## 8. Submission-readiness checklist

Use the status labels below only after inspecting the actual team folder.

| Item | What to verify | Status |
|---|---|---|
| Report | PDF and editable LaTeX source exist and agree | Not independently verified in this draft |
| README | Source identity, environment, commands, measurement rules and limitations are documented | Not independently verified in this draft |
| Part 1 | Baseline source, pattern records/counts, editable diagrams and rendered images | Not independently verified in this draft |
| Part 2 | Evolved source, three change folders, diffs and actual test evidence | Not independently verified in this draft |
| Part 3 | Eight implementations, tests, common fixtures, runtime versions and timing evidence | Not independently verified in this draft |
| Datasets | Required CSVs and Excel workbook are consistent | Not independently verified in this draft |
| LLM verification | Actual prompts, raw outputs, metadata and human-review evidence exist | Not independently verified in this draft |
| Team information | Student details, contributions and references are complete | Not independently verified in this draft |
| Repository | Correct team folder and required hierarchy are present | Not independently verified in this draft |

## 9. Prioritized actions

### Critical
1. Reconcile report totals against source, CSV and test logs.
2. Verify that transaction limits and fraud checks execute before wallet mutation.
3. Confirm cross-language fixtures are identical and all reported test results are reproducible.

### High
4. Confirm daily usage calculation, persistence/reset behavior and concurrency limitations.
5. Check all PlantUML diagrams against actual source and ensure required rendered files exist.
6. Ensure LLM records point to real prompts, raw outputs and verification evidence.

### Medium
7. Recalculate LOC and complexity under documented, consistent rules.
8. Reconcile the Excel workbook with the CSV datasets.
9. Clarify benchmark startup costs and preserve raw timing samples.

### Low
10. Improve report navigation and remove repeated claims once evidence is consistent.
11. Ensure README commands and paths match the final repository layout.

## 10. Conclusion

The B9 report presents a coherent progression from seven baseline pattern collaborations to an evolved wallet design with additional currency, limit and fraud-processing abstractions. It also defines common Strategy and Observer examples for four programming languages. The intended contribution is modularity and a reproducible comparison of design choices. The final strength of these conclusions depends on source-backed pattern roles, correctly ordered transfer validation, consistent datasets, actual test logs and reproducible benchmark evidence. The report's stated results should remain labelled as reported until those checks have been completed.
