# Decorator in C++

Based on JUnit's D10 Timeout Invocation Wrappers (`SameThreadTimeoutInvocation`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o decorator main.cpp
./decorator ../test-data/invocations.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o decorator_test test_main.cpp
./decorator_test
```

To diff the program output against the expected file yourself:

```sh
./decorator ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Decorator-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `decorator.hpp` | `Invocation` (pure virtual component), `TestInvocation`, `InvocationDecorator` (owns the wrapped object), two concrete decorators, parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- Each decorator owns the object it wraps as `std::unique_ptr<Invocation>`; building `Logging(Timeout(test))` moves ownership inwards, and destroying the outer object frees the whole chain.
- `LoggingInvocation` borrows the shared log by reference.
- `override` and `final` let the compiler check every decorator against the component.
