# Part 3 — Cross-language pattern comparison

## Pattern selection

This part compares **Strategy** and **Adapter**. Strategy is represented by Part 2's `PaymentProvider` contract with profile-selected HTTP and simulated implementations. Adapter is represented by Part 2's `HttpPaymentProvider`, which translates an external provider's HTTP protocol into the application payment contract. Both patterns have concrete, behaviorally equivalent examples in Java, C++, Python and JavaScript.

### Strategy: project significance and problem

The Strategy pattern defines a shared operation for interchangeable policies and lets a context delegate behavior to the selected policy. In this project, Billing invokes `PaymentProvider` through a common operation while Spring configuration selects a local simulated provider or external HTTP provider. This keeps invoice processing independent of provider-specific payment logic.

### Adapter: project significance and problem

The Adapter pattern translates one collaborator's interface into the contract its client expects. Billing needs the `PaymentProvider` contract, while an external payment service speaks its own HTTP request/response protocol. `HttpPaymentProvider` adapts that protocol and returns the application-level payment reference. The examples use an intentionally small legacy gateway so the conversion can be compared across languages.

Each language uses the same examples and inputs:

- Strategy: apply standard and premium pricing policies to 10,000 cents; expected results are 9,000 and 8,000 cents.
- Adapter: send 2,599 cents through a legacy gateway that accepts a decimal major-unit amount; expected result is `APPROVED`, 2,599 cents and reference `legacy-25.99`.

The source and separate test runners are grouped under `Strategy/` and `Adapter/`, with `java/`, `cpp/`, `python/` and `javascript/` subfolders. Every test runner checks the same inputs and expected outputs.

## Comparison

| Aspect | Strategy | Adapter |
|---|---|---|
| Intent and project significance | Select a behavior through a stable contract. Billing can change providers without changing invoice orchestration. | Make an incompatible collaborator usable through the expected contract. Billing remains insulated from provider protocol details. |
| Project evidence | `PaymentProvider`, `HttpPaymentProvider`, `SimulatedPaymentProvider` | `HttpPaymentProvider` implements `PaymentProvider` and maps HTTP requests/responses |
| Syntax | A policy interface/class is passed to a context object. | A wrapper implements the target operation and forwards converted values to the adaptee. |
| Abstraction and interface | `DiscountStrategy` contract; `PriceCalculator` context. | `PaymentProvider` target; `LegacyGatewayAdapter` wrapper; `LegacyGateway` adaptee. |
| Inheritance and composition | Java `implements`, C++ virtual base; context composes a strategy in every language. | Java/C++ adapter conforms to a target type and composes the adaptee; Python/JS use structural object shape and composition. |
| Java | Explicit interfaces and classes; static type checks. | Explicit target interface and concrete wrapper; static type checks. |
| C++ | Abstract base class and virtual dispatch. | Abstract target class and composition around the legacy class. |
| Python | Duck-typed policy objects; no declared interface is required. | Duck-typed wrapper translates the legacy method and result. |
| JavaScript | Function-bearing objects are injected; shape compatibility is checked at runtime. | Object wrapper translates the legacy call and normalizes its result at runtime. |
| Dependency management | No third-party package. Java/C++ compile; Python/JS run in their language runtimes. | Same; the examples rely only on standard libraries/runtime features. |
| Memory management | Garbage-collected in Java/Python/JS; explicit object lifetime and RAII in C++. | Same language difference; adapter owns or references the adaptee through composition. |
| Concurrency | Examples are stateless and safe to share; concurrent mutable policies would need synchronization. | Examples are stateless; a real network adapter also needs timeouts and concurrent-call policy. |
| Implementation complexity and readability | One policy class/object per pricing rule. Java/C++ make roles explicit; Python/JS reduce interface boilerplate. | One wrapper adds a boundary conversion. Explicit types make the target clear; dynamic versions are shorter. |
| Flexibility and maintainability | Add a policy without changing the context; selection can vary at runtime. | Change or replace the adaptee behind the wrapper without changing the target client; conversion logic stays localized. |
| Typical use | Pricing, routing, sorting, payment or notification policies. | Legacy SDKs, provider APIs, protocol and schema conversion. |

The examples keep branching out of the pattern participants so their maximum per-function cyclomatic complexity is 1 under the rule below. The Python and JavaScript versions use structural/duck typing; Java and C++ make the contract explicit in the type system. C++ was compiled with GCC 6.3.0 in C++17 mode on the available environment; Java uses JDK 17.0.20.1, Python uses 3.14.4, and JavaScript uses Node.js 24.15.0.

## Commands and measurements

Run each test from its language subfolder. Commands, source paths, compiler versions, results and measured medians are in `llm/pattern_crosslanguage.csv`. Raw five-run timings and captured program output are in `evidence/runtime_runs.md`.

Measurement procedure: compile C++ and Java once before timing; run one warm-up process, then five measured process launches per snippet on the same machine. Timings use `Stopwatch.GetTimestamp` in PowerShell and include process startup, program execution, and capture of stdout; the examples have no stdin. Compilation is excluded. `median_process_ms` is the median of the five elapsed durations. Raw durations are retained in `evidence/runtime_runs.md`.

Source LOC counts nonblank production lines and excludes standalone comments and test files. Maximum function cyclomatic complexity is counted manually with the same McCabe rule for each language: 1 plus each `if`/`else if`, loop, `case`, `catch`, ternary, `&&`, or `||` decision in a function. This deliberately small example has no decision branches in production functions, so the maximum is 1. The module entry-point guards in Python and JavaScript are top-level, not functions.

## Limitations

These are small, deterministic pattern demonstrations, not production payment systems. They intentionally omit database access, authentication, currencies, localization, network retries, and asynchronous processing. The measured process time is dominated by language runtime startup and should not be interpreted as an algorithm benchmark. The C++ compiler available here is old; use a current C++17 compiler for a modern environment. No external dependencies are required.
