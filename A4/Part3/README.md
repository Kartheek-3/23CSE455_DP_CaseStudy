# Part 3 — Cross-language comparison

This part compares six tracked pattern types using small, behavior-focused
snippets in Java, Python, JavaScript, and C++. The existing implementations and
their test runners are retained unchanged.

## Deliverables

- `Part3_prompt.txt`: the Part 3 task specification for the four-language comparison. The saved model prompt and associated artifacts remain under `llm/`.

- `Part3_Report.md` and `Part3_Report.pdf`: canonical report; the PDF is built
  from the Markdown source.
- `test-cases/common_spec.md`: shared inputs, expected outcomes, and test scope.
- `../data/cross_language.csv`: 24 language/pattern rows. C++ LOC and CCN
  include both implementation and header files.
- `source_mapping_corrections.md`: verified application source paths and the
  Part 1 audit limitation.
- `evidence/test_results/`: preserved historical runner logs.
- `evidence/recomputed_metrics/`: fresh cloc and Lizard output for the
  canonical dataset.
- `llm/`: prompt, supplied-input manifest, existing generated artifacts, and
  current verification record. The prior raw model response was not retained.

## Run the tests

Run commands from the A4 team folder. Each language directory has its own
README with the compile/run command. For example:

```bash
python3 Part3/composite_condition/python/test_runner.py
node Part3/composite_condition/javascript/testRunner.js
javac -d Part3/composite_condition/java/bin Part3/composite_condition/java/ConditionComposite.java Part3/composite_condition/java/TestRunner.java
java -cp Part3/composite_condition/java/bin composite.TestRunner
g++ -O2 -std=c++14 -I Part3/composite_condition/cpp Part3/composite_condition/cpp/condition_composite.cpp Part3/composite_condition/cpp/test_runner.cpp -o Part3/composite_condition/cpp/test_runner.exe
Part3/composite_condition/cpp/test_runner.exe
```

C++ test runners use the Windows performance counter API and require MinGW on
Windows. Java class files, Python caches, executables, and Finder metadata are
ignored by `Part3/.gitignore` and should not be submitted.

## Recompute static metrics

```bash
python3 Part3/evidence/remeasure_static_metrics.py
```

This requires cloc 2.10 and Lizard 1.24.1. To rerun timing benchmarks, use
`Part3/evidence/run_benchmarks.py` in the recorded Windows/MinGW environment.
It writes to `evidence/recomputed_*` so it does not overwrite the preserved
historical logs. Runner timers exclude process, JVM, and interpreter startup.

`llm/A4_slide.pdf` and its `.tex` file are preserved as the earlier visual
summary. Its original metrics were based on C++ `.cpp` files alone; use the
canonical report and `data/cross_language.csv` for corrected production LOC.
