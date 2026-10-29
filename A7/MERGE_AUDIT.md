# Comprehensive Merge Audit & Conflict Resolution Log

**Case Study Title:** Design Pattern Analysis and Evolution in a Ruby on Rails Hotel Booking Application  
**Course:** 23CSE455 — Design Patterns  
**Merge Date:** 2026-10-11  
**Target Submission Directory:** `A7/` at the archive root  
**Target Package:** `A7_Final_Submission.zip`  

---

## 1. Executive Summary & Objective

This audit documents the synthesis of the final, professor-compliant academic submission from two workspace input directories:
- **`A7/`**: The authoritative technical implementation containing the complete upstream Rails source snapshot (170 manifest-verified source files; 171 files in data/code/ including SOURCE_PROVENANCE.md), reproducible checkpoints, unified diff patches, RSpec receipts (5/0 -> 13/0 -> 21/0 -> 36/0), 4-language cross-benchmarks, and a 29-page LaTeX report (`A7_Report.tex` / `A7_Report.pdf`).
- **`TEAM_8/`**: Supporting documentation including `SUBMISSION_CHECKLIST.md`, README organizational structure, and submission review artifacts.

The merge was checked against the supplied case-study instructions, resolving the documented structural, schema, and line-ending inconsistencies. Because `initial_input_hashes.json` is absent, full input-directory immutability is not claimed as independently proven by this package.

---

## 2. Input Immutability Guarantee

As mandated by Absolute Rule 1, both source directories remained strictly read-only:
- `Design-Pattern-Casestudy/A7/` (170 manifest-verified upstream source files; 171 packaged files in data/code/ including SOURCE_PROVENANCE.md) — **UNTOUCHED**
- `Design-Pattern-Casestudy/TEAM_8/` (106 files) — **UNTOUCHED**

The reviewed archive does **not** contain `initial_input_hashes.json`, so the claimed pre-merge hash record and a complete byte-for-byte immutability comparison cannot be independently verified from this package. No substitute or reconstructed historical hash record has been fabricated. The included `data/baseline_source_manifest.json` independently verifies the 170 upstream files it enumerates in `data/code/`; it does not prove immutability of every file in the original `A7/` and `TEAM_8/` inputs.

---

## 3. Conflict Resolution & Decision Matrix

| Conflict Area | Options Considered | Decision Made | Rationale |
|---|---|---|---|
| **Team Identity & Roll Numbers** | (A) Use TEAM_8 placeholder `TEAM_REPLACE_ME` / Team A8.<br>(B) Use Team A7 with student roll numbers `AM.AI.U4AID23016`, `23037`, `23040`, `23046`. | **Selected Option B: Team A7** | Both directories belong to the same 4 students from the AI & DS department. A7 contains complete attribution and LaTeX source matching university records; placeholders in TEAM_8 were unfinished drafts. |
| **Baseline Application Source (`data/code/`)** | (A) Use TEAM_8's 8-file skeleton.<br>(B) Use A7's upstream Rails application source snapshot (170 manifest-listed files). | **Selected Option B: A7 application source snapshot** | Upstream commit `5e15551ee646871b4bed32c982fa17da319d3ee3` must be physically present and reproducible. 170 files are verified against `data/baseline_source_manifest.json`. |
| **Part 1 Architecture Diagram** | (A) TEAM_8 sequential/inheritance diagram (`CrudConcern <|-- BookingsController`).<br>(B) A7 parallel mixin diagram (`BookingsController ..> CrudConcern`). | **Selected Option B: A7 parallel mixin diagram** | In Ruby on Rails, `CrudConcern` is an `ActiveSupport::Concern` mixin included via `include`, not a class inherited sequentially. The three concrete controllers connect in parallel. |
| **Part 2 Checkpoint & Line Endings** | (A) Leave Windows CRLF (`\r\n`) in place (causes `check_part2` and `check_csv` assertion errors).<br>(B) Normalize checkpoint and evolved source to LF (`\n`). | **Selected Option B: Normalize to LF** | Git patches and POSIX tools in Ruby/Rails expect LF line endings. Normalization eliminated 16 CRLF artifact differences and allowed patch replay and recipe tests to pass with 0 errors. |
| **Experiment 07 Hash References** | (A) Fabricate historical hashes.<br>(B) Update `input-07-source-hashes.json` and section headers in `input-07-part2-verification.md` to reflect the exact LF hashes of the verified files. | **Selected Option B: Genuine hash updates** | Ensures complete provenance and honesty. Disclosed that hashes reflect normalized LF bytes, preserving verification integrity without falsifying evidence. |
| **Dataset Locations** | (A) Maintain duplicate CSV copies in `Part1/`, `Part2/`, `Part3/llm/` as in TEAM_8.<br>(B) Keep canonical datasets only in `data/` as in A7. | **Selected Option B: Single canonical `data/` directory** | Page 3 of `DP_Csestudy_instruct.pdf` strictly instructs: *"Keep one report and one dataset folder... Do not repeat the four CSVs inside them."* `check_csv.py` explicitly enforces absence of mirrors. |
| **Submission Checklist** | (A) Omit checklist.<br>(B) Adapt `TEAM_8/SUBMISSION_CHECKLIST.md` and verify all items. | **Selected Option B: Adapt and update checklist** | Provides a comprehensive, professor-facing verification matrix at the root of `FINAL_MERGED_SUBMISSION/`. |
| **Report PDF Naming** | (A) Include two competing names (`A7_Report.pdf` and `A7_Final_Report.pdf`).<br>(B) Use canonical `A7_Report.pdf` matching `A7_Report.tex`. | **Selected Option B: Canonical `A7_Report.pdf`** | Consistent with report build script, LaTeX sources, and instructions. |

---

## 4. Automated Verification Results

All three verification tools were executed directly against `FINAL_MERGED_SUBMISSION/`:

### A. Part 2 Checkpoints, Patches & AST Metrics (`check_part2.py`)
```text
PASS original: 171 files match recipe and SHA-256 manifest
PASS Change1: 177 files match recipe and SHA-256 manifest
PASS Change2: 180 files match recipe and SHA-256 manifest
PASS Change3: 189 files match recipe and SHA-256 manifest
PASS Booking.active introduced in Change2 before use; Change3 only introduces refund Strategy
PASS Change1: real unified patch applies and reproduces next checkpoint (LF-normalized)
PASS Change2: real unified patch applies and reproduces next checkpoint (LF-normalized)
PASS Change3: real unified patch applies and reproduces next checkpoint (LF-normalized)
PASS data/ is the sole authoritative pattern, count, evolution, LLM and cross-language dataset location
PASS metric source coverage/hashes/SLOC, JSON/CSV aggregates, and report/slides tables agree
PASS participant/observation source records, counts, report and slide tables agree
```
**Status: 100% PASS**

### B. Canonical CSVs & Report Source References (`check_csv.py`)
```text
CSV consistency: PASS (0 failures)
Report source paths: PASS (0 failures)
```
- Validated `patterns.csv`, `patterns_evolution.csv`, `pattern_counts.csv`, `cross_language.csv`, `llm.csv`.
- Validated all 8 cross-language implementations and 5-sample timing medians.
- Validated all source references in `A7_Report.tex`.
**Status: 100% PASS (0 Failures)**

### C. Baseline Integrity, Secret Scan & Packaging (`check_submission.py`)
```text
PASS: 170 original upstream files match SHA-256 manifest.
PASS: high-confidence secret scan across 1277 final files, including extracted PDF text.
Scope: private keys, GitHub tokens, AWS access keys, Stripe live keys, Google API keys, credential URLs, key filenames.
Reviewed exclusions: upstream synthetic test passwords; commented generated Devise secret/pepper examples; encrypted credentials.yml.enc without master.key. No live credentials were found.
```
**Status: 100% PASS**

---

## 5. Deliverable Packaging & Integrity Proof

This audit file was updated for the final repair. Earlier archive paths, hashes, page-review statements, and validation counts below are historical and do not validate the newly generated archive. The final archive validation receipt is `A7_Final_Submission.validation.txt` alongside the downloadable ZIP. The slide PDF is stored at `Part3/llm/A7_slide.pdf`, matching the prescribed Part3/llm placement; its LaTeX source remains `A7_slide.tex` at the team-folder root.

- **Final Submission Directory:** `A7/` (generated from the finalized team folder).
- **Archive Path:** `A7_Final_Submission.zip` (external download artifact; not nested inside `A7/`).
- **ZIP SHA-256:** Recomputed after the P1 documentation and structure repairs; see the companion validation receipt.
- **ZIP Hierarchy:** Exactly one top-level folder `A7/`; the manifest is generated from the actual finalized folder.
- **Archive Verification:** The exact generated ZIP is extracted to a temporary directory and checked with `tools/check_submission.py --zip`; CRC and byte-for-byte manifest validation are required.

---

## 6. Unresolved Limitations & Academic Disclosures

1. **Environment:** Full Rails 7 / PostgreSQL test suite was executed in an earlier containerized environment. Historical receipts (36 passing RSpec examples) are retained in `Part2/verification/`. In the packaging environment, Ruby 3.3.8 syntax parsing was verified.
2. **Historical Prompts:** Prompts 02 and 03 retain unrecoverable history notes and are clearly labeled without fabricated transcripts.
3. **Experiment 07:** Represents a genuine re-verification conducted with the GPT-6 model family on 2026-10-11.
