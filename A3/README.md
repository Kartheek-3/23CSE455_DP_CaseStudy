
# Design Pattern Usage and Evolution in an ASP.NET Core Banking Application

This repository contains a design-pattern case study based on the open-source [BankSystem](https://github.com/banksystembg/BankSystem) application. It examines selected parts of the banking application, documents the design patterns found in the baseline source, implements three focused changes, and compares selected patterns across multiple programming languages.

## Project Scope

The case study focuses on three areas:

- Account management
- Authentication and authorization
- Transactions and payments

The repository includes the source versions used for the analysis, pattern inventories, implementation changes, tests, diagrams, cross-language examples, and the consolidated report.

## Design Patterns

The analysis covers both Gang of Four (GoF) patterns and architectural patterns. The inventory records **3 pattern types and 6 named collaborations in the baseline**, and **5 pattern types and 9 named collaborations in the final version**. These totals describe the case-study inventory; they should not be interpreted as nine distinct GoF patterns.

The baseline includes Adapter, Builder, and Service Layer collaborations. The final implementation adds:

- **Strategy** for alternative two-factor authentication verification.
- An additional **Service Layer** collaboration for shared internal payment posting.
- **Chain of Responsibility** for sequential payment-rule checks.

Detailed mappings and counting rules are available in the CSV datasets and `Part1/evidence/module_map.md`.

## Implemented Changes

### 1. Recovery Codes for Two-Factor Authentication

Adds a recovery-code option alongside authenticator-based verification. Users can generate replacement recovery codes after password confirmation. The implementation uses separate strategies for the verification options and relies on ASP.NET Identity for one-time recovery-code redemption.

### 2. Shared Internal Payment Posting

Adds a bill-payment workflow and routes internal transfers and bill payments through a shared service. The service posts debit and credit entries with matching ledger entries in a relational transaction and records the transaction type.

### 3. Payment-Rule Chain

Introduces a linked sequence of checks for positive payment amounts, sufficient funds, and a configurable inclusive single-transfer limit. The chain applies to internal transfers and bill payments; it is not a global fraud-prevention system.

## Repository Structure

```text
.
├── README.md
├── BankingCaseStudy_Report.pdf
├── BankingCaseStudy_Report.tex
├── UPLOAD_TO_GITHUB.md
├── team.json
├── data/
│   ├── code/                      # Baseline application source
│   ├── patterns.csv
│   ├── pattern_counts.csv
│   ├── patterns_evolution.csv
│   ├── cross_language.csv
│   ├── llm.csv
│   ├── source_manifest.json
│   └── test_result/
├── Part1/
│   ├── evidence/                  # Module map and pattern candidates
│   └── pattern_architecture/      # Editable diagrams and exports
├── Part2/
│   ├── changes/                   # Three change sets, patches and snapshots
│   ├── code/                      # Final application source
│   ├── tests/
│   └── diagrams/
├── Part3/                         # Cross-language examples and evidence
└── tools/                         # Verification, measurement and test utilities
```

The CSV files under `data/` are the authoritative datasets and are not duplicated across the part folders.

## Baseline and Source Versions

- **Upstream repository:** https://github.com/banksystembg/BankSystem
- **Baseline commit:** `9af0ff8e42e4769d370203ae681e913339ec0121`
- **Source inspection date:** 24 October 2026
- **Application stack:** ASP.NET Core / .NET Core 3.1, C# 8, and .NET Standard 2.1
- **Database:** SQL Server with Entity Framework Core

The repository preserves the baseline source and the source snapshots after each change. Each change includes a unified patch and a SHA-256 snapshot manifest. `tools/verify_package.py` checks source hashes, replays the patches, and validates evidence paths and dataset counts.

The application is a legacy-source academic case study. Some upstream configuration/workflow files are excluded; see `data/source_manifest.json`. Do not treat this repository as a production-ready banking system or use real account credentials.

## Testing

Recorded test results:

| Test group | Result |
|---|---:|
| Baseline test suite | 129/129 passed |
| Existing upstream tests against final assemblies | 129/129 passed |
| New evolution tests | 26/26 passed |
| Cross-language tests | 92 cases passed |

The hosted environment could not run VSTest normally because of a process-metadata API failure. The included runner executes supported Fact and InlineData test cases. Intermediate source snapshots were preserved, but their complete test suites were not separately executed.

The full web application was not verified end-to-end with SQL Server, real email, reCAPTCHA, and CentralApi. Browser authorization/antiforgery flows and production migration execution still require local verification.

### Run .NET Tests

Install a compatible .NET SDK and the .NET / ASP.NET Core 3.1.32 runtime for the legacy target. From the repository root:

```sh
dotnet build Part2/code/src/Web/BankSystem.Web/BankSystem.Web.csproj -m:1

dotnet test data/code/src/Tests/BankSystem.Services.Tests/BankSystem.Services.Tests.csproj -m:1

dotnet test Part2/code/src/Tests/BankSystem.Services.Tests/BankSystem.Services.Tests.csproj -m:1

dotnet test Part2/tests/BankingEvolution.Tests.csproj -m:1
```

The provided test runner can also be built and executed for the baseline, regression, and evolution suites.

## Cross-Language Comparison

`Part3/` contains examples of Adapter, Builder, Service Layer, Strategy, and Chain of Responsibility in **Java, Python, JavaScript, and C++**.

The comparison includes 20 production snippets, 20 test runners, five shared TSV fixtures, and 92 passing test cases. These examples demonstrate reduced pattern collaborations; they do not reproduce the full ASP.NET application or its SQL Server/provider integrations.

To run the measurement script:

```sh
python3 -m pip install lizard==1.21.0
python3 tools/measure.py
```

The measurements include production lines of code and maximum function cyclomatic complexity. Timing samples include process startup, fixture reading, and tests, but exclude compilation. These small-program timings are not banking-throughput benchmarks or a universal ranking of programming languages.

## Build and Run the Application

Use a disposable local development database and fresh development credentials. Windows is the simplest environment for the upstream SQL Server application; modern Linux may require compatible legacy libraries or a development container.

1. Configure a disposable SQL Server database.
2. Copy `tools/appsettings.example.json` to `Part2/code/src/Web/BankSystem.Web/appsettings.Development.json`.
3. Configure the local connection string and development RSA / SendGrid settings using user secrets or environment variables. Do not commit local configuration.
4. Configure `Billers` with unique IDs for local demo recipient accounts.
5. Run the application from the repository root:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project Part2/code/src/Web/BankSystem.Web/BankSystem.Web.csproj
```

The application startup applies migrations, including the migration that adds `Transfers.TransactionType`. Review and back up any existing database before running migrations. Do not use real accounts or production credentials.

## Report and Diagrams

- `BankingCaseStudy_Report.pdf` — consolidated report.
- `BankingCaseStudy_Report.tex` — editable report source.
- `Part1/pattern_architecture/` and `Part2/diagrams/` — editable diagrams and exported PDF/SVG versions.
- `tools/faculty_template.tex` — supplied report template retained for reference.

To build the report, run the following twice from the directory containing the `.tex` file:

```sh
pdflatex -interaction=nonstopmode -halt-on-error BankingCaseStudy_Report.tex
pdflatex -interaction=nonstopmode -halt-on-error BankingCaseStudy_Report.tex
```

## Verification

Run the package integrity check from the repository root (Git is required):

```sh
python3 tools/verify_package.py
```

This validates the packaged source snapshots, patches, evidence paths, and dataset counts. It does not rerun the application test suites.

## Limitations

- The full web application and external integrations were not tested end-to-end.
- Concurrent SQL Server/deadlock behavior and operational recovery were not load-tested.
- The new payment service does not include a request-idempotency registry, invoice deduplication, or a durable email outbox.
- The new payment-rule chain applies only to internal transfers and bill payments.
- Existing global, card, and direct-payment flows retain their original behavior.
- Pattern classifications and source mappings should receive human review before academic submission.



---

**Academic case study:** This repository documents source analysis, selected design-pattern changes, and supporting tests. It is not intended for processing real financial transactions.
