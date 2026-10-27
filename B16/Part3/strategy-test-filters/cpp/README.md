# Strategy in C++

Based on JUnit's A3 Post-Discovery Filter Policies (`PostDiscoveryFilter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o strategy main.cpp
./strategy ../test-data/tests.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o strategy_test test_main.cpp
./strategy_test
```

To diff the program output against the expected file yourself:

```sh
./strategy ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Strategy-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `strategy.hpp` | `TestFilter` abstract class (strategy), three `final` concrete strategies, `TestSelector` (context), parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- `TestFilter` has pure virtual functions, so a strategy that misses one does not compile; concrete strategies are `final`.
- `TestSelector` borrows the strategy by `const&`; the strategies are owned by `report()` as `std::unique_ptr<TestFilter>` in a vector, so ownership is explicit.
- Selection uses `std::copy_if` with a lambda.
