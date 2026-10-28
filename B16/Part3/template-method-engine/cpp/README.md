# Template Method in C++

Based on JUnit's B1 Hierarchical Engine Execution Skeleton (`HierarchicalTestEngine.execute`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o template main.cpp
./template ../test-data/tests.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o template_test test_main.cpp
./template_test
```

To diff the program output against the expected file yourself:

```sh
./template ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Template Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `template.hpp` | `TestEngine` (non-virtual `execute`, pure virtual `run_test`, virtual hooks), two `final` engines, parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- `execute` is not `virtual`, so it cannot be overridden polymorphically; the primitive is pure virtual and the hooks are virtual with empty bodies.
- Primitive and hooks are `protected`: only the template method calls them, which C++ can express directly.
- `report()` uses the two engines through `TestEngine*`, i.e. dynamic dispatch.
