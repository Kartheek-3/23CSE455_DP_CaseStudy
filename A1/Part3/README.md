# Part 3 — cross-language comparison

- `order_events_and_delivery_selection/{java,python,javascript,cpp}/` — the team's original combined Observer + Strategy demonstrations (unchanged), each with `README.md` and `run_tests.sh`.
- `test-cases/` — shared fixture and rules (`cases.json`) and the expected output (`expected_output.txt`).
- `tools/check_output.py` — black-box checker used by every `run_tests.sh`; `tools/measure.py` — LOC, cyclomatic complexity and timing.
- `evidence/` — test logs, lizard output, raw and summary timings, toolchain versions.

Measurement rules are in the team `README.md`. Results are summarised in `data/cross_language.csv` and in §4 of the report.
