# Template Method Pattern — C++ Implementation

## 1. Overview

This project implements the Template Method design pattern as part of Part 3 of the Design Pattern Identification and Evolution case study.

The current implementation uses a generic mutation-processing pipeline inspired by the GraphQL Mutation Pipeline identified in the original Django Job Portal project.

**Important:** This is a generic Template Method example, not yet an exact reproduction of the original GraphQL pipeline.

## 2. Implementation Structure

| Component | Responsibility |
|---|---|
| `MutationPipeline` | Defines the fixed execution sequence |
| `validate()` | Validates input data |
| `perform_mutation()` | Pure virtual operation customized by subclasses |
| `format_response()` | Formats the result |
| `CreateJobMutation` | Implements job creation behavior |
| `CreateCompanyMutation` | Implements company creation behavior |

The template method is `execute()`, which runs validation, mutation, and response formatting in a fixed order.

## 3. Files

- `main.cpp` — Template Method implementation
- `test_runner.cpp` — Tests for job mutation, company mutation, and validation
- `README.md` — Documentation and measured results

## 4. Requirements

- C++17
- GCC 16.2.0 (MSYS2)
- No external libraries required

## 5. How to Run

Compile the implementation:

```powershell
g++ -std=c++17 main.cpp -o main.exe
```

Run the demonstration:

```powershell
.\main.exe
```

Compile the tests:

```powershell
g++ -std=c++17 test_runner.cpp -o test_runner.exe
```

Run the tests:

```powershell
.\test_runner.exe
```

## 6. Test Results

**Verified result: 3 test groups passed, 0 failed.**

| Test | Expected behavior | Result |
|---|---|---|
| Job mutation | Returns a successful job result | PASS |
| Company mutation | Returns a successful company result | PASS |
| Validation | Rejects input missing the required `name` field | PASS |

All Template Method tests passed successfully.

## 7. Measured Metrics

| Metric | Result |
|---|---|
| Language | C++ |
| C++ standard | C++17 |
| Compiler | GCC 16.2.0 (MSYS2) |
| Source LOC (`main.cpp`, excluding blank and comment lines) | 76 |
| Test groups passed | 3 |
| Test groups failed | 0 |
| Runtime measurements | 5 |
| Median observed runtime | 0.1141219 seconds |
| Minimum observed runtime | 0.0778483 seconds |
| Maximum observed runtime | 0.1210958 seconds |

### Runtime Measurement Data

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.1210958 |
| 2 | 0.1180298 |
| 3 | 0.0778483 |
| 4 | 0.0842981 |
| 5 | 0.1141219 |

The median is **0.1141219 seconds**.

**Measurement limitation:** Timings were collected locally using PowerShell's `Measure-Command`. They include process startup and program execution, so they do not represent pure Template Method execution time.

Maximum cyclomatic complexity has not yet been measured and is intentionally omitted.

## 8. Design Pattern Summary

The Template Method pattern defines a fixed algorithm in a base class while allowing subclasses to customize a particular operation. Here, subclasses implement `perform_mutation()` while inheriting the common execution sequence.

In C++, inheritance and a pure virtual function enable subclasses to customize the mutation operation while the base class maintains the execution order through `execute()`.

For the final case study, this implementation should be aligned with the original GraphQL Mutation Pipeline before being treated as a faithful cross-language reproduction.
