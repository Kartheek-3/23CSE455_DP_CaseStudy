# Measurement and reproduction notes

## Static measurements

The canonical dataset is `data/cross_language.csv`. Production LOC is the
`cloc` code count with blank and comment lines excluded. Maximum function CCN
comes from Lizard over production files only. For C++, both the `.cpp` and
matching `.hpp` files are included; the earlier generated CSV counted only the
`.cpp` file and undercounted production LOC, particularly for Memento. The
earlier CSV remains unchanged at `Part3/llm/pattern_crosslanguage.csv` as
historical output. Recomputed tool output is in
`Part3/evidence/recomputed_metrics/`.

To recompute these static values from the team folder, run:

```bash
python3 Part3/evidence/remeasure_static_metrics.py
```

This requires cloc 2.10 and Lizard 1.24.1 and updates only
`data/cross_language.csv` plus the recomputed output logs.

## Timing and test results

The saved benchmark labels the runtimes as OpenJDK 23.0.2, Python 3.11.9,
Node.js 22.16.0, and MinGW GCC 6.3.0. Its one warm-up and five measured runs
time the test-runner body. They exclude process creation and JVM/interpreter
startup, so the old CSV header `median_process_ms` is retained for compatibility
but should be read as runner-body milliseconds. Hardware/OS details were not
preserved with the original timing logs, limiting timing reproducibility.

During this review, Python, JavaScript, and Java suites all passed locally
(18/18 runners) using Python 3.12.2, Node.js 22.15.0, and OpenJDK 17.0.10.
Those are different runtime versions from the saved benchmark environment.
The six C++ runners could not be rebuilt on this macOS host because their
timing harnesses include Windows `windows.h` / `QueryPerformanceCounter` and
the expected MinGW toolchain is unavailable here. The existing Windows run
logs were preserved and are reported as prior evidence, not as newly reproduced
results.

The workloads are small, pattern-specific functional suites. Their timings are
not a fair general-purpose ranking of language performance; the PDF/CSV should
not attribute the values to startup overhead or make broad performance claims.
