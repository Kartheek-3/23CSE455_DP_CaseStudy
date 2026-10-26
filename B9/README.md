# B9 - Quarkus Digital Wallet Pattern Case Study

This folder is the reproducible technical submission for **Design Pattern Identification and Evolution in a Quarkus-Based Digital Wallet Application**. The baseline is a deliberately small, self-contained Quarkus-style service model created for this case study; it is not claimed to be a production payment system.

## Team and Student Roster
Upload repository: `https://github.com/aswathymohan-amrita/23CSE455_DP_CaseStudy`  
Course: **23CSE455 - Design Patterns**  
Team: **B9**  

| Roll Number | Student Name | Batch (CSE A / EAC / AIDS / AIE) |
| --- | --- | --- |
| AM.SC.U4AIE23008 | K Adithya varma | AIE |
| AM.SC.U4AIE23051 | P Vishnu chaitanya | AIE |
| AM.SC.U4AIE23061 | U Shashank | AIE |
| AM.SC.U4AIE23040 | K Sai Sri Sushanth | AIE |

## Submission Metadata

| Item | Value |
| --- | --- |
| Team | B9 |
| Case Study Title | Design Pattern Identification and Evolution in a Quarkus-Based Digital Wallet Application |
| Application Source | Quarkus Reference Service Model (`Part1/code/digital-wallet` and `Part2/code/digital-wallet`) |
| Baseline Source Version | `baseline-local-2026-10-11` |
| Evolved Source Version | `evolved-local-2026-10-11` (CH01, CH02, CH03 applied) |
| Target Java Environment | Java 17; Quarkus 3.40.1; Maven 3.9+ |
| Persistence Model | In-memory repository for an isolated, inspectable pattern study |

## Inspected Modules & Scope
- **Baseline Scope (`Part1/code/digital-wallet`)**:
  - `com.b9.wallet.application.WalletFacade` (Facade pattern)
  - `com.b9.wallet.domain.Transaction` (Builder pattern)
  - `com.b9.wallet.domain.Money` (Value Object)
  - `com.b9.wallet.domain.Wallet` (Aggregate root)
  - `com.b9.wallet.notification.*` (Observer pattern: `NotificationPublisher`, `TransactionObserver`, `EmailNotifier`, `AuditNotifier`)
  - `com.b9.wallet.repository.WalletRepository` (Repository pattern)
  - `com.b9.wallet.transaction.*` (State pattern: `TransactionState`, `PendingState`, `CompletedState`; Command pattern: `TransferCommand`)
- **Evolved Scope (`Part2/code/digital-wallet`)**:
  - Replaces `WalletFacade` with evolved `WalletService` facade.
  - Replaces incremental `Transaction.Builder` with immutable record constructor.
  - Adds `CurrencyConversionStrategy`, `CurrencyStrategyFactory`, `VendorFxAdapter` (CH01).
  - Adds `PerTransferLimit` and `DailyLimitDecorator` (CH02).
  - Adds `FraudCheckChain`, `DenyListCheck`, and `VelocityCheck` (CH03).
  - Adds Quarkus REST endpoints (`WalletResource`) with CDI `@Inject` wiring and DTO records.

## Complete Folder Hierarchy
```text
23CSE455_DP_CaseStudy/
|-- B9/
|   |-- README.md
|   |-- B9_Report.pdf
|   |-- B9_Report.tex
|   |-- data/
|   |   |-- code                       # original application source
|   |   |-- test_result                # testcases, screenshot..etc
|   |   |-- patterns.csv
|   |   |-- pattern_counts.csv
|   |   |-- patterns_evolution.csv
|   |   |-- cross_language.csv
|   |   |-- llm.csv
|   |   |-- B9_Digital_Wallet_Dataset.xlsx
|   |-- Part1/
|   |   |-- patterns.csv
|   |   |-- Pattern_count.csv
|   |   |-- pattern_architecture       # diagram source + image
|   |   |-- Part1_prompt.txt
|   |   '-- llm.csv
|   |-- Part2/
|   |   |-- code/                      # evolved application source
|   |   |-- changes/
|   |   |   |-- Change1/               # requirement, diff, test result
|   |   |   |-- Change2/               # requirement, diff, test result
|   |   |   '-- Change3/               # requirement, diff, test result
|   |   |-- pattern_evalution.csv
|   |   |---- Pattern_count.csv
|   |   |-- diagrams                   # updated UML where needed
|   |   |-- Part2_prompt.text
|   |   '-- llm.csv
|   |-- Part3/
|   |   |-- Strategy/                  # repeat for each pattern type
|   |   |   |-- java/                  # snippet, test runner, README
|   |   |   |-- python/                # snippet, test runner, README
|   |   |   |-- javascript/            # snippet, test runner, README
|   |   |   '-- cpp/                   # snippet, test runner, README
|   |   |-- Observer/                  # repeat for each pattern type
|   |   |   |-- java/                  # snippet, test runner, README
|   |   |   |-- python/                # snippet, test runner, README
|   |   |   |-- javascript/            # snippet, test runner, README
|   |   |   '-- cpp/                   # snippet, test runner, README
|   |   '-- llm/
|   |       |-- part3_prompt.txt
|   |       |-- llm.csv
|   |       |-- pattern_crosslanguage.csv
|   |       '-- B9_slide.pdf
```

## Run and Measurement Rules
- **Part 2 Application Execution**:
  From `Part2/code/digital-wallet`:
  - `mvn quarkus:dev` starts the Quarkus live coding dev mode.
  - `mvn test` runs the JUnit 5 test suite (`DigitalWalletRulesTest` and `WalletResourceTest`).
  - *Note*: Marked `not_run: no JDK` if the grading workstation does not expose JDK 17 / Maven.
- **Part 3 Snippet Execution**:
  - Java: `cd Part3/java && javac PatternDemos.java && java PatternDemos`
  - Python: `cd Part3/python && python pattern_demos.py` (Passed: 4/4 assertions)
  - JavaScript: `cd Part3/javascript && node pattern_demos.js` (Passed: 4/4 assertions)
  - C++: `cd Part3/cpp && g++ -std=c++17 pattern_demos.cpp -o pattern_demos && ./pattern_demos`
- **LOC Measurement Rule**: Production lines only; strictly excludes blank lines, comment-only lines, test classes, and README documents.
- **Cyclomatic Complexity Rule**: Decision counting: 1 base plus decision predicates (`if`, `else if`, loops, `case`, `catch`, ternary/short-circuit operators).
- **Process Timing Rule**: One warmup execution, followed by five measured whole-process executions on the same host; median reported in milliseconds. Missing environments are left strictly blank per assignment instructions.

## Important Limitations
This reference study demonstrates design pattern identification, evolution, and cross-language mappings. It intentionally omits live external banking networks, distributed consensus, production encryption keyrings, PCI DSS certification, database transaction isolation levels, and monetary regulatory compliance.
