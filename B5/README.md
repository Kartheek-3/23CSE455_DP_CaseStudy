# Team B5 - 23CSE455 Design Patterns Case Study

## Case study

**Assigned application:** Travel Planning Application using Ruby on Rails  
**Case study title:** Design Pattern Identification and Evolution in a Ruby on Rails-Based Travel Planning Application  
**Application analyzed:** DaPlanStan  
**Original repository:** https://github.com/GeertClaes/daplanstan  
**Stated baseline commit:** `da54d9ab8bfc118e99375fdd6c506efb20b66e5b`  
**Source archive first inspected:** 2026-10-08  
**License in supplied source:** O'Saasy License  

The supplied source archive contains no `.git` directory, so the ZIP-to-commit match is recorded as stated provenance rather than independently proven Git metadata.

## Team Members and Individual Contributions

Team: B5  
Batch: B , CSE-'D'

| Roll Number | Student Name | Team Work Division | Contribution in Faculty Submission |
|---|---|---|---|
| AM.SC.U4CSE23356 | Shreya E R | Team Part 1 | Application understanding and framework architecture. Studied the DaPlanStan repository, technology stack, application flow, inspected modules and prepared architecture evidence used in the Application and Architecture section of the report. |
| AM.SC.U4CSE23351 | S Hemarshitha | Team Part 2 | Faculty Part 1 – Pattern Discovery. Identified and verified the frozen baseline of 9 pattern instances across 3 pattern types, prepared participant-role mappings, source evidence, rejected candidates, pattern counts and UML evidence. |
| AM.SC.U4CSE23301 | Aakash Choudhary | Team Part 3 | Faculty Part 2 – Software Evolution and Refactoring. Implemented and analysed the three evolution scenarios: personalized itinerary generation, multiple booking providers and cancellation policies; maintained before/after evidence and pattern evolution records. |
| AM.SC.U4CSE23333 | Manish S D A | Team Part 4 | Faculty Part 3 – Cross-Language Analysis. Implemented representative pattern problems in Java, Python, JavaScript and C++, executed the shared tests and prepared the cross-language comparison evidence. |
| AM.SC.U4CSE23331 | M Tanmayi | Team Part 5 | LLM provenance, human-verification coordination and final documentation. Consolidated LLM records, verification evidence, datasets, report structure and final submission artifacts. |



## Official faculty-part mapping

The final repository uses the faculty's three technical parts only:

- **Part 1 - Pattern Discovery:** destination management, itinerary management, hotel/flight/activity booking, customer management, payment, cancellation and notification were investigated in the original source.
- **Part 2 - Software Evolution:** personalized itinerary generation, multiple booking providers and different cancellation policies.
- **Part 3 - Cross-Language Analysis:** the short case-study brief requested two significant patterns; the later detailed CSV instruction required one representative for every detected pattern type. The team followed the stricter requirement and implemented all five confirmed types in Java, Python, JavaScript and C++.

## Environment

Original/evolved Rails application:

- Ruby 3.4.2
- Rails 8.1.3
- SQLite through Active Record
- Puma 7.2.0 observed in the successful test-environment boot
- Turbo / Stimulus
- Action Mailbox, Action Mailer, Active Job / Solid Queue
- OmniAuth Google/Apple integration
- Anthropic, Geocoder/Nominatim, Pexels and Active Storage boundaries

Cross-language runtimes used for recorded verification:

- OpenJDK / javac 21.0.12.1
- Python 3.13.5
- Node.js 22.16.0
- g++ 14.2.0, C++17

## Run and test commands

### Rails application

Normal repository setup follows the application's README (`bundle install`, database setup/migration, then Rails development startup). Final coursework verification on Windows used Ruby 3.4.2 and the locked bundle.

The successful full-suite command was:

```bat
set "RAILS_ENV=test" && bundle exec ruby -I"C:/Ruby34-x64/lib/ruby/gems/3.4.0/gems/minitest-mock-5.27.0/lib" -e "require './config/environment'; ActiveJob::Base.queue_adapter = :test; load 'bin/rails'" test
```

Actual final result:

`59 runs, 359 assertions, 0 failures, 0 errors, 0 skips`

Raw evidence: `data/test_result/rails/rails_test_pass.log`.

Rails/Puma also booted successfully in the test environment and was shut down cleanly. See `data/test_result/rails/rails_boot_summary.txt`.

### Cross-language snippets

Each language directory contains its own README and test command. The canonical 20 commands/results are in `data/cross_language.csv`.

Recorded totals:

- Strategy: 60/60
- Observer: 28/28
- Controller: 32/32
- Information Expert: 32/32
- Adapter: 40/40
- **Overall: 192/192**

## Pattern inventory and evolution

Frozen original baseline:

- Controller (GRASP): 6
- Information Expert (GRASP): 1
- Observer (GoF): 2
- **Total: 9 instances / 3 types**

Final cumulative evolved source:

- Controller (GRASP): 9
- Information Expert (GRASP): 1
- Observer (GoF): 2
- Adapter (GoF): 1
- Strategy (GoF): 1
- **Total: 14 instances / 5 types**

Evolution progression: 9 -> 10 -> 12 -> 14 instances.

## Measurement rules

### Application source LOC

For before/after evolution metrics, the same rule is used for every snapshot:

- include `app/**/*.rb` and `config/routes.rb`;
- exclude blank lines and comment-only lines;
- exclude tests, views, generated database files, documentation, fixtures and evidence scripts.

Results are stored in `Part2/evidence/evolution_metrics.csv` and the method in `Part2/evidence/EVOLUTION_METRICS_METHOD.md`.

### Cross-language source LOC

`source_loc` in `data/cross_language.csv` counts production code only, excluding blank lines, comments and tests. Where a C++ implementation has a production header and source file, both production files are included.

### Cyclomatic complexity

`max_function_cc` is the maximum function/method cyclomatic complexity recorded by the project measurement scripts in `Part3/evidence/`. The same stored rule is used within the cross-language comparison.

### Timing

Compile first where applicable, then one warm-up and five measured fresh-process executions on the same machine. `median_process_ms` is the median elapsed process time and includes process/runtime/test-harness overhead; it is not a pure algorithm benchmark.

## LLM records and human verification

The canonical `data/llm.csv` contains 29 provenance-audited rows with the required columns:

`part,model_and_date,prompt_file,input_file,output_file,evaluation,verification_file`

Authentic full ChatGPT conversation PDFs are also retained:

- `Part1/Part1_prompt.pdf` - official Part 1 pattern-discovery chat
- `Part1/llm/Architecture_Chat_ShreyaER.pdf` - architecture chat
- `Part2/Part2_prompt.pdf` - official Part 2 evolution chat
- `Part3/llm/part3_prompt.pdf` - official Part 3 cross-language chat
- `Part3/llm/Final_Documentation_Chat_MTanmayi.pdf` - final documentation/verification chat

Historical model identifiers that were not recoverable are marked `cannot confirm`; no model name was invented.

Human-verification evidence is in `data/test_result/human_verification/`. The consolidated sheet contains 148 items: 143 verified, 3 partially verified and 2 cannot confirm. The original reviewer labels are preserved; `REVIEWER_NAME_MAP.md` maps them to the official submission names.

## Repository-relative path rule

All canonical CSV paths are relative to this `B5/` folder. For Scenario 1 and Scenario 2 source locations stored inside saved ZIP snapshots, archive members use the form:

`Part2/code/snapshots/<snapshot>.zip!<archive-root>/<source-path>:<lines>`

This keeps the exact saved input ZIPs while still making every reference start from the team folder.

## Final folder structure

```text
B5/
├── README.md
├── B5_Report.pdf
├── B5_Report.tex
├── data/
│   ├── patterns.csv
│   ├── pattern_counts.csv
│   ├── patterns_evolution.csv
│   ├── cross_language.csv
│   ├── llm.csv
│   ├── code/
│   │   └── original/
│   └── test_result/
│       ├── rails/
│       └── human_verification/
├── Part1/
│   ├── Part1_prompt.pdf
│   ├── code/
│   ├── pattern_architecture/
│   ├── evidence/
│   └── llm/
├── Part2/
│   ├── Part2_prompt.pdf
│   ├── code/
│   │   ├── final/
│   │   └── snapshots/
│   ├── changes/
│   │   ├── Change1/
│   │   ├── Change2/
│   │   └── Change3/
│   ├── diagrams/
│   ├── evidence/
│   └── llm/
└── Part3/
    ├── controller/
    ├── information_expert/
    ├── observer/
    ├── adapter/
    ├── strategy/
    ├── common_specs/
    ├── evidence/
    └── llm/
        ├── part3_prompt.pdf
        ├── Final_Documentation_Chat_MTanmayi.pdf
        └── B5_slide.pdf
```

The canonical CSVs are stored once under `data/` rather than duplicated inside the part folders, following the faculty note to keep one dataset folder.


