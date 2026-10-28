# Test results

Re-run of every test in the case study on 2026-10-25, after the team folder was reorganised.
All files except this README and `run_all_tests.py` are produced by:

```bash
python -B data/test_result/run_all_tests.py      # from the team folder
```

| File | What it is | Result |
|---|---|---|
| `part2_pytest_case_study.txt` / `.png` | pytest on `Part2/code/mycodo/tests/case_study` | 83/83 passed |
| `part2_change1_demo.txt` / `.png` | `Part2/changes/Change1/demo.py` (crop profiles) | exit code 0, same output as `demo_output.txt` |
| `part2_change2_demo.txt` / `.png` | `Part2/changes/Change2/demo.py` (irrigation strategies) | exit code 0, same output as `demo_output.txt` |
| `part2_change3_demo.txt` / `.png` | `Part2/changes/Change3/demo.py` (sensor alerts) | exit code 0, same output as `demo_output.txt` |
| `part3_tests_<pattern>.txt` | compile + run output of the 4 runners of one pattern | all passed |
| `part3_summary.txt` / `.png` | last line of each of the 32 Part 3 runners | 32/32 passed |

The `.png` files are terminal-style captures rendered from the `.txt` logs next to them.

Test cases:

- Part 2: `Part2/code/mycodo/tests/case_study/` (characterization tests + one test file per change).
- Part 3: `Part3/test-cases/SPEC.md` and one `<pattern>_cases.csv` per pattern, shared by all four languages.

Per-change before/after test logs are in `Part2/changes/ChangeN/test_result.log`, and the original Part 3
evidence is in `Part3/evidence/`.
