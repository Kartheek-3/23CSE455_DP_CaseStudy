# Master Handoff — Team A7 Submission

**Course:** 23CSE455 — Design Patterns  
**Case study:** Design Pattern Analysis and Evolution in a Ruby on Rails Hotel Booking Application  
**Package root:** `A7/`  
**Status:** Structural and automated package checks pass; two human/administrative items remain open.

## 1. Prescribed final structure

The archive contains one top-level `A7/` folder. The structure follows page 3 of the supplied `DP_Csestudy_instruct.pdf`:

- `README.md`, `A7_Report.pdf`, and `A7_Report.tex` at the team-folder root.
- `data/code/` contains the original Rails application source.
- `data/test_result/` contains test receipts, PDF build/review evidence, page renders, and validation records.
- `data/` contains the single authoritative set of five CSV datasets and `baseline_source_manifest.json`.
- `Part1/` contains pattern discovery and baseline architecture evidence.
- `Part2/` contains the evolved application, three change folders, reproducible checkpoints, metrics, diagrams, and verification notes.
- `Part3/` contains Template Method and Strategy examples in Java, Python, JavaScript, and C++, shared tests, evidence, and `llm/A7_slide.pdf`.
- `A7_slide.tex`, `tools/`, `llm-analysis/`, `SUBMISSION_CHECKLIST.md`, `MERGE_AUDIT.md`, `MASTER_HANDOFF.md`, and `FINAL_TREE.txt` are retained at the team-folder root.

The package does not duplicate the canonical CSV datasets inside Part1, Part2, or Part3. Python cache directories and `.pyc` files are excluded by the packaging validator.

## 2. A7 / TEAM_8 merge decisions

- **Team identity:** A7 is used because the A7 materials contain the completed report/source attribution and named team roster. TEAM_8 materials were treated as supporting organizational/checklist material, not as the authoritative application snapshot.
- **Original application:** The A7 baseline source is retained under `data/code/`. `data/baseline_source_manifest.json` verifies 170 upstream source files. The packaged directory has 171 files because `SOURCE_PROVENANCE.md` is an added provenance note.
- **Part 1 architecture:** The diagram models `CrudConcern` as a Ruby module mixed into the three concrete controllers, not as a superclass.
- **Part 2 evolution:** The three saved checkpoints and real unified patches are retained. Intermediate Change1 and Change2 are disclosed as reconstructed pedagogical stages, not historical commits.
- **Dataset placement:** One canonical `data/` dataset location is used, as directed by the professor's instructions.
- **Historical hash limitation:** `initial_input_hashes.json` is absent from the reviewed archive. No historical hash record has been invented. `MERGE_AUDIT.md` now explicitly limits its hash-integrity claim to the included 170-file baseline manifest; that manifest does not prove every original A7/TEAM_8 input file was immutable.

## 3. Implementation and evidence

- Pattern inventory: one confirmed baseline Template Method collaboration; Strategy is introduced in Change3.
- Checkpoint source counts validated by `check_part2.py`: original 171 files, Change1 178, Change2 181, Change3 190.
- Each Change1–Change3 unified patch applies and reproduces the next checkpoint after documented LF normalization.
- Metric JSON/CSV coverage, source hashes, SLOC, aggregate complexity, report tables, slide tables, participant/observation counts, and the sole canonical CSV location are checked by the validator.
- Historical Rails/RSpec receipts report cumulative results of 5/0, 13/0, 21/0, and 36/0 examples/failures. These are retained historical receipts; the current packaging run did **not** rerun the full Rails/PostgreSQL suite.
- `A7_Report.pdf` was rebuilt from `A7_Report.tex` with XeLaTeX in two passes (both exit code 0), and has 29 physical pages.
- `Part3/llm/A7_slide.pdf` was rebuilt from `A7_slide.tex` with XeLaTeX in two passes (both exit code 0), and has 13 physical pages. The earlier Tectonic receipt's `nullfont` missing-character warning is absent in the rebuilt PDF. A final 13-page contact sheet was inspected; no clipping or overlap was observed. Non-blocking hyperref metadata warnings remain. The Windows Tectonic executable was not available in the current Linux workspace.

## 4. Actual automated validation results

The following commands were run from the `A7/` directory after the hierarchy/path and PDF changes:

### `python tools/check_part2.py`

**Exit code: 0**

```text
PASS original: 171 files match recipe and SHA-256 manifest
PASS Change1: 178 files match recipe and SHA-256 manifest
PASS Change2: 181 files match recipe and SHA-256 manifest
PASS Change3: 190 files match recipe and SHA-256 manifest
PASS Booking.active introduced in Change2 before use; Change3 only introduces refund Strategy
PASS Change1: real unified patch applies and reproduces next checkpoint (LF-normalized)
PASS Change2: real unified patch applies and reproduces next checkpoint (LF-normalized)
PASS Change3: real unified patch applies and reproduces next checkpoint (LF-normalized)
PASS data/ is the sole authoritative pattern, count, evolution, LLM and cross-language dataset location
PASS metric source coverage/hashes/SLOC, JSON/CSV aggregates, and report/slides tables agree
PASS participant/observation source records, counts, report and slide tables agree
```

### `python tools/check_csv.py`

**Exit code: 0**

```text
CSV consistency: PASS (0 failures)
Report source paths: PASS (0 failures)
```

### `python tools/check_submission.py`

**Exit code: 0**

```text
PASS: 170 original upstream files match SHA-256 manifest.
PASS: high-confidence secret scan across final files, including extracted PDF text.
```

### Archive validation

The exact archive `/mnt/data/A7_Final_Submission.zip` was checked after extraction/manifest comparison with:

```bash
python tools/check_submission.py --zip /mnt/data/A7_Final_Submission.zip
```

**Exit code: 0**

```text
PASS: ZIP has one top-level A7/ folder; 1277 files match final content; CRC check passed.
```

The archive validator also reran the checkpoint verifier and baseline/secret checks successfully. The generated companion receipt records the ZIP SHA-256. After this handoff document was finalized, the ZIP was regenerated and the exact new archive was revalidated; the final archive validation exit code was 0. Use the companion receipt for the final archive's SHA-256 and exact member count.

## 5. Limitations and remaining blockers

1. **Team contributions — pending human confirmation.** The README and report consistently avoid assigning individual responsibilities until the team confirms who did what. Confirm with all members, then update both documents consistently.
2. **Submission date — unverified.** The report and slides label the date as unverified because no reliable source record established the actual submission date.
3. **Initial input hashes — unavailable.** `initial_input_hashes.json` was not present. Do not claim full input-directory immutability based only on the baseline manifest.
4. **Rails integration rerun — not performed in this packaging environment.** Historical Rails/RSpec receipts are preserved and accurately labeled; current validators cover checkpoint reconstruction, CSV/report references, baseline hashes, secrets, and package integrity, not live Rails/PostgreSQL execution.
5. **Compiler difference.** The rebuilt PDFs were produced with system XeLaTeX because the retained Windows Tectonic executable was unavailable. The slide nullfont warning was resolved in this build; harmless metadata/auxiliary warnings remain documented in `data/test_result/pdf_A7_slide_build.txt`.

## 6. Reproduction commands

From the extracted `A7/` directory:

```bash
python tools/check_part2.py
python tools/check_csv.py
python tools/check_submission.py
python tools/check_submission.py --zip /path/to/A7_Final_Submission.zip
```

The final `FINAL_TREE.txt` is regenerated from the package's actual included files. `tools/check_submission.py` excludes cache folders, `.pyc` files, runtime directories, TeX build intermediates, and external validation sidecars. The final archive is expected to contain no `__pycache__/`, `_pycache_/`, or `.pyc` members.
