# Command in C++

Based on JUnit's B9 Node Execution Tasks (`NodeTestTask` / `TestTask`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o command main.cpp
./command ../test-data/tasks.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o command_test test_main.cpp
./command_test
```

To diff the program output against the expected file yourself:

```sh
./command ../test-data/tasks.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Command-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `command.hpp` | `Command` (pure virtual), two concrete commands, `TaskExecutor` owning `unique_ptr<Command>`s, parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- The executor owns its commands as `std::unique_ptr<Command>`; `submit` takes ownership with `std::move`, and executed commands are destroyed when the queue is cleared.
- Commands are polymorphic through the pure virtual `execute`.
- `std::count` computes the passed tests from the results.
