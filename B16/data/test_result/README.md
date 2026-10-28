# Test results (index)

These logs come from real runs on my Mac. Every Gradle run used `--rerun --no-build-cache`, with old results deleted first.

| File | What |
|---|---|
| `baseline_launcher_tests.log` | JUnit 6.1.3 (`f59f60d`) launcher tests: 382 passed, 0 failed |
| `baseline_all_platform_tests.log` | JUnit 6.1.3, all `platform-tests`: 2452 passed, 6 skipped, 0 failed |
| `before_ch02_all_jupiter_tests.log` | all `jupiter-tests` before CH02 (no Jupiter code changed before it): 3381 passed, 165 skipped, 0 failed |
| `junit_test_counts_by_commit.txt` | test counts at every commit, counted from the JUnit XML results |
| `part3_run_all_mac.txt` | Part 3: all 30 compile/run/test commands for the 8 programs, all exit 0 |

The test logs for each change are in `Part2/changes/Change1..3/`: refactoring and feature runs, mutation checks, and demo logs on the official vs the evolved jar. The Part 3 sanitizer, leak and timing evidence is in `Part3/` (`cpp-sanitizer-mac.txt`, `timing-raw.csv`).
