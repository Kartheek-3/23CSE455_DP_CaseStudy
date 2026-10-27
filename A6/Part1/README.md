# Part 1 - Application study and pattern discovery

- `code/` - Sarathi backend at upstream commit `c8766f4` (see top-level README for the excluded files and redactions).
- `diagrams/architecture.puml|png` - layered architecture and ride-request flow.
- `diagrams/baseline_patterns.puml|png` - UML of the main baseline collaborations.
- `evidence/test_results.txt` - characterization tests on the unchanged baseline (14/14).
- `evidence/test_harness.patch` - the test files and npm script added for that run (no `src` change).
- `evidence/tsc_baseline.txt` - `tsc --noEmit` on the baseline: 7 errors from dependency-version drift.
- `evidence/baseline_metrics.json` - NLOC / CC of every `src` file (`tools/ts_metrics.js`): 223 files, 8,232 NLOC, 399 functions.
- `evidence/source_manifest.sha256` - checksums of `code/`.

## Method
1. Mapped the seven case-study areas (rider, driver, trip, payment, matching, location, notification) to files.
2. Listed candidates from names, interfaces, DI registrations and the first LLM pass (`prompts/Dilip_Kumar_Reddy_claude_*`).
3. For each candidate, traced the real calls: who implements the interface, who injects it, who calls it, and whether the
   roles of the pattern exist. A class name, decorator or LLM statement alone was not accepted.
4. Recorded confirmed collaborations in `data/patterns.csv` (16 instances, 10 types) and rejected/uncertain candidates
   (6 rejected, 2 uncertain) in the report and in `tools/pattern_data.py`.
5. Wrote characterization tests for behaviour that Part 2 had to keep or fix.

Diagrams: S Leela Shankar. LLM records for this part: `prompts/README.md` (Dilip Kumar Reddy, S Leela Shankar).
