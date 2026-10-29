# Chain of Responsibility in Java

Based on JUnit's D9 Invocation Interceptor Chain (`InvocationInterceptorChain`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/chain/*.java test/chain/*.java
java -cp out chain.ChainDemo ../test-data/invocations.txt
java -cp out chain.ChainTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out chain.ChainDemo ../test-data/invocations.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/chain/ChainTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Chain of Responsibility-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `Interceptor.java` | Handler interface |
| `LoggingInterceptor.java`, `DisabledInterceptor.java`, `TimeoutInterceptor.java` | Concrete handlers |
| `InterceptorChain.java` | Builds the chain (link i calls handler i with `proceed`) |
| `Invocation.java` | Request |
| `ChainDemo.java` | Parsing, wiring, `main` |

## How the pattern comes out in Java

- A handler receives the request and a `proceed` callback (`Supplier<String>`) instead of a fixed `next` field, so the same handlers can be reordered in any chain. JUnit does the same through `Invocation.proceed()`, which `InvocationInterceptorChain` wires to the next interceptor.
- A handler ends the chain by returning without calling `proceed.get()` (see `DisabledInterceptor`).
- The chain is built recursively in `InterceptorChain.link`.
