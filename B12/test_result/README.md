# Test Results

This directory holds actual test command output. Nothing here is placeholder or
fabricated.

## Part 2 — evolution changes

- `part2_jest_full.txt` — full Jest run of the evolved backend.
- `baseline_preexisting_failures_raw.txt` — proves the 3 failing suites also fail on
  the untouched baseline (pre-existing repository defects, not caused by Part 2).
- `part2_summary.md` — summary of commands and results.

Per-change logs live in `../Part2/changes/ChangeN/test_result/`.

## Part 3 — cross-language snippets

Raw run logs are in `../Part3/evidence/` (one file per pattern × language).

Environment used for Part 2: Node v24.18.0, Jest 30.2.0, run from a disposable copy
of the baseline backend in which `npm install` (not `npm ci`) was used, because the
baseline `package-lock.json` is out of sync.
