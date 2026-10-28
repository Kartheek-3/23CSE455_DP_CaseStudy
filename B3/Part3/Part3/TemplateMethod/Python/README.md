# Template Method Pattern — Python Implementation

## 1. Overview

This project implements the Template Method design pattern as part of Part 3 of the Design Pattern Identification and Evolution case study.

The current implementation uses a generic mutation-processing pipeline inspired by the GraphQL Mutation Pipeline identified in the original Django Job Portal project.

**Important:** This is a generic Template Method example, not yet an exact reproduction of the original GraphQL pipeline.

## 2. Implementation Structure

| Component | Responsibility |
|---|---|
| `MutationPipeline` | Defines the fixed execution sequence |
| `validate()` | Validates input data |
| `perform_mutation()` | Abstract operation customized by subclasses |
| `format_response()` | Formats the result |
| `CreateJobMutation` | Implements job creation behavior |
| `CreateCompanyMutation` | Implements company creation behavior |

The template method is `execute()`, which runs validation, mutation, and response formatting in a fixed order.

## 3. Files

- `main.py` — Template Method implementation
- `test_runner.py` — Tests for job mutation, company mutation, and validation
- `README.md` — Documentation and measured results

## 4. Requirements

- Python 3.13.15
- No external packages required

## 5. How to Run

Run the demonstration:

```powershell
python main.py
```

Run the tests:

```powershell
python test_runner.py
```

## 6. Test Results

**Verified result:** 3 test groups passed, 0 failed.

| Test | Expected behavior |
|---|---|
| Job mutation | Returns a successful job result |
| Company mutation | Returns a successful company result |
| Validation | Rejects input missing the required `name` field |

## 7. Measured Metrics

| Metric | Result |
|---|---|
| Language | Python |
| Python version | 3.13.15 |
| Source LOC (`main.py`, excluding blank and comment lines) | 33 |
| Test groups passed | 3 |
| Test groups failed | 0 |
| Runtime measurements | 5 |
| Median observed runtime | 0.088082 seconds |
| Minimum observed runtime | 0.067071 seconds |
| Maximum observed runtime | 0.190749 seconds |

### Runtime Measurement Data

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.090941 |
| 2 | 0.088082 |
| 3 | 0.190749 |
| 4 | 0.067071 |
| 5 | 0.073514 |

The median is **0.088082 seconds**.

**Measurement limitation:** Timings were collected locally using PowerShell's `Measure-Command`. They include Python process startup and program execution, so they do not represent pure Template Method execution time.

Maximum cyclomatic complexity has not yet been measured and is intentionally omitted.

## 8. Design Pattern Summary

The Template Method pattern defines a fixed algorithm in a base class while allowing subclasses to customize a particular operation. Here, subclasses implement `perform_mutation()` while inheriting the common execution sequence.

For the final case study, this implementation should be aligned with the original GraphQL Mutation Pipeline before being treated as a faithful cross-language reproduction.
