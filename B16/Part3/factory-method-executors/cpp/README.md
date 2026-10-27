# Factory Method in C++

Based on JUnit's B2 Engine Collaborator Factory Methods (`HierarchicalTestEngine.createExecutorService`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o factory main.cpp
./factory ../test-data/tests.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o factory_test test_main.cpp
./factory_test
```

To diff the program output against the expected file yourself:

```sh
./factory ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Factory Method-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `factory.hpp` | `TestEngine` (creator, pure virtual `create_executor` returning `unique_ptr<Executor>`), concrete engines and products, parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- The factory method returns `std::unique_ptr<Executor>`, so the caller (`execute`) owns the product and it is freed when `execute` returns.
- Factory method and product are pure virtual; `create_executor` is `protected` because only `execute` should call it.
- Engines are temporaries in `report`.
