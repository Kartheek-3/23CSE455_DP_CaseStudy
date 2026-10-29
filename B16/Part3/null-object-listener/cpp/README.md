# Null Object in C++

Based on JUnit's C7 No-op Listeners (`EngineExecutionListener.NOOP`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o nullobject main.cpp
./nullobject ../test-data/tests.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o nullobject_test test_main.cpp
./nullobject_test
```

To diff the program output against the expected file yourself:

```sh
./nullobject ../test-data/tests.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Null Object-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `nullobject.hpp` | `TestListener` (pure virtual), `NoOpListener::instance()` (null object), `ConsoleListener`, `TestRunner` holding a reference, parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- The runner holds a `TestListener&`; a reference can never be null, so the language itself removes the null check, and the default argument binds it to the singleton `NoOpListener::instance()`.
- The null object is a function-local static, created once and never freed explicitly.
- The test compares addresses to show the null object is used.
