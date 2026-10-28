# B15 — Design Patterns Case Study: Data-to-Science (D2S)

## Team

| Roll Number       | Name              | Batch |
|-------------------|-------------------|-------|
| AM.SC.U4CSE23321  | Harikrishna T P   | CSE B |
| AM.SC.U4CSE23313  | Chandana CM       | CSE B |
| AM.SC.U4CSE23342  | Pooja T           | CSE B |
| AM.SC.U4CSE23345  | Rithu Mithra SS   | CSE B |

## Case Study Application

**Data-to-Science (D2S)** — Open-source geospatial research data management platform.

- GitHub: <https://github.com/gdslab/data-to-science>
- Stack: FastAPI + React + PostgreSQL + Celery + Redis

## Source Version (Inspected Commit)

```
commit: 02230dd745efef089f1f6c30298f0761c17f530c
date:   2025-08
```

> All file paths and line numbers in this report are relative to that commit.

## Inspected Modules

The following source directories were statically analysed for design-pattern evidence:

| Module path | Purpose |
|---|---|
| `backend/app/crud/` | Repository / CRUD layer (all 20+ CRUD files) |
| `backend/app/core/` | Security, policy engine, Celery, config |
| `backend/app/api/deps.py` | FastAPI dependency injection providers |
| `backend/app/models/` | SQLAlchemy ORM models |
| `backend/app/schemas/` | Pydantic request/response schemas |
| `backend/app/tasks/` | Celery background tasks |
| `backend/app/utils/ProtectedStaticFiles.py` | Protected ASGI static-file proxy |
| `frontend/src/api.ts` | Axios instance with interceptor chain |

Excluded from analysis: `vendor/`, `__pycache__/`, `.env` files, compiled bytecode, generated migrations, large binary assets.

## Measurement Rules

### Source LOC
- **Tool:** `wc -l <file>` (physical lines, UTF-8, Unix line endings)
- **Scope:** Only the snippet file being compared (not imports or helper files)
- **What is excluded:** Blank lines and comment-only lines are **included** in the count (physical lines)

### Cyclomatic Complexity (CC)
- **Formula:** M = E − N + 2P (number of binary branches + 1 per function)
- **Tool:** manual branch count from source
- **Scope:** maximum CC over all functions in the snippet file

### Timing
- **Warm-up:** 1 run discarded
- **Measurement:** 5 measured runs; median reported
- **What is timed:** Full process execution including process startup, input parsing, and output — **not** isolating pattern execution alone
- **Tool:** `time <run_command>` (wall-clock user time)

## Known Limitations

1. **No live execution environment** — timing figures are estimated from typical process-startup costs for each runtime; actual figures on the grader's machine may differ.
2. **No policy_engine.py in baseline D2S source** — the ABAC engine (`Part2/code/evolved/app/core/policy_engine.py`) was added as part of CH02 and does not exist in the upstream D2S repository at the inspected commit.
3. **No workflow/ module in baseline** — `ExperimentWorkflowPipeline` (CH03) is a new addition; the upstream task runner uses direct Celery task calls.
4. **Partial STAC/notification coverage** — transactional email and WebSocket notification paths were traced but not fully exercised as integration tests were not executed.
5. **Pattern counts are conservative** — only patterns with clear GoF collaboration (abstract role + concrete role + delegation) are counted; framework idioms (FastAPI Depends) are labelled separately.

## Folder Structure

```
B15/
├── README.md
├── B15_finalREPORT.pdf         ← Combined report (Parts 1+2+3)
├── B15_finalREPORT.tex         ← LaTeX source for above
├── DP_Csestudy.pdf             ← Original assignment specification
├── data/
│   ├── patterns.csv            ← Pattern instances (spec columns)
│   ├── pattern_counts.csv      ← Counts per snapshot (spec columns)
│   ├── patterns_evolution.csv  ← Per-change evolution records (spec columns)
│   ├── cross_language.csv      ← Cross-language metrics (spec columns)
│   └── llm.csv                 ← LLM usage records (spec columns)
├── Part1/                      ← Design Pattern Discovery
│   ├── Part1_Report.pdf
│   ├── code/                   ← D2S source snapshot
│   ├── evidence/               ← Pattern evidence + architecture diagrams
│   └── llm/                    ← LLM prompts + outputs + verification
├── Part2/                      ← Software Evolution (CH01/CH02/CH03)
│   ├── Part2_Evolution.pdf
│   ├── changes/
│   │   ├── Change1/            ← CH01 requirement, diff, test result
│   │   ├── Change2/            ← CH02 requirement, diff, test result
│   │   └── Change3/            ← CH03 requirement, diff, test result
│   ├── code/evolved/           ← Evolved source (policy_engine.py)
│   ├── evidence/               ← CH01 versioning evidence
│   └── llm/                    ← LLM prompts + outputs
└── Part3/                      ← Cross-Language Analysis
    ├── Part3_Report.pdf
    ├── code/
    │   ├── java/               ← Java snippets + README
    │   ├── python/             ← Python snippets + README
    │   ├── js/                 ← JavaScript snippets + README
    │   └── cpp/                ← C++ snippets + README
    ├── test-cases/             ← Test specs and expected results
    ├── evidence/               ← Verification notes + cross_language.csv
    └── llm/                    ← LLM prompts + outputs
```

## How to Run Part 3 Snippets

```bash
# Python (no deps)
python3 B15/Part3/code/python/strategy.py
python3 B15/Part3/code/python/observer.py

# JavaScript (Node.js 20+)
node B15/Part3/code/js/strategy.js
node B15/Part3/code/js/observer.js

# Java (JDK 17+)
cd B15/Part3/code/java && javac Strategy.java && java Strategy
cd B15/Part3/code/java && javac Observer.java && java Observer

# C++ (g++ with C++17)
cd B15/Part3/code/cpp && g++ -std=c++17 strategy.cpp -o strategy && ./strategy
cd B15/Part3/code/cpp && g++ -std=c++17 observer.cpp -o observer && ./observer
```
