# Chain of Responsibility in C++

Based on JUnit's D9 Invocation Interceptor Chain (`InvocationInterceptorChain`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `cpp/` folder; Apple clang 21.0.0, C++20)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o chain main.cpp
./chain ../test-data/invocations.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o chain_test test_main.cpp
./chain_test
```

To diff the program output against the expected file yourself:

```sh
./chain ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_main.cpp`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Chain of Responsibility-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `chain.hpp` | `Interceptor` (pure virtual handler), three `final` handlers, `run_chain` (recursive links), `Invocation` struct, parsing and `report` |
| `main.cpp` | Command line entry |

## How the pattern comes out in C++

- `proceed` is a `std::function<std::string()>` built from a lambda that captures the chain and request by reference, which is safe because both outlive the call.
- Handlers are owned by the chain as `std::unique_ptr<Interceptor>`.
- `run_chain` is a recursive function with a default index argument.
