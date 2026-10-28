# Cross-language design-pattern examples

Part 3 provides a self-contained implementation and executable test for every pattern appearing in this case study. Every pattern directory follows one consistent layout: `pattern_name/language/snippet + test runner + README`.

```text
Part3/
  <pattern_name>/                  # one of the 14 names below
    java/                          # Snippet.java, TestRunner.java, README.md
    python/                        # snippet.py, test_runner.py, README.md
    javascript/                    # snippet.js, test_runner.js, README.md
    cpp/                           # snippet.hpp, test_runner.cpp, README.md
  representative_comparison/       # original combined Strategy + Observer fixture
    java/  python/  javascript/  cpp/
  evidence/                        # retained execution outputs and timing data
  llm/                             # prompt and response record
```

Pattern directories: `adapter`, `builder`, `chain_of_responsibility`, `command`, `decorator`, `dependency_injection`, `dto`, `facade`, `observer`, `repository`, `simple_factory`, `state`, `strategy`, and `value_object`.

Every language directory has a minimal fixture that demonstrates the named pattern and a runner that checks its expected behavior. Run its local command documented in the language README. Python and JavaScript use their standard installed runtimes; Java needs JDK 17+ and C++ needs a C++17 compiler.

`representative_comparison/` is deliberately separate from the one-pattern-per-directory examples. It preserves the original measured Strategy/Observer fixture referenced by `data/cross_language.csv`; it is not part of the new reusable pattern-example layout.
