# Adapter in C++

Based on JUnit's B7 Engine-to-Launcher Listener Adapter (`ExecutionListenerAdapter`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o adapter main.cpp
./adapter ../test-data/events.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o adapter_test test_main.cpp
./adapter_test
```

To diff the program output against the expected file yourself:

```sh
./adapter ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Adapter-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `adapter.hpp` | `EngineListener` (target, pure virtual), `TestListener` (adaptee), `ListenerAdapter` (adapter), engine side and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- The adapter is a `final` class that overrides the pure virtual target functions; it holds the adaptee by reference, so it does not own it.
- The optional parent is a `std::optional<std::string>` instead of a null value.
- Unique ids are parsed with `std::regex` and `std::sregex_iterator`.
