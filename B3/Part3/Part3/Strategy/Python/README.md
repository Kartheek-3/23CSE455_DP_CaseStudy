# Strategy Pattern — Python Implementation

## 1. Overview

This project implements the Strategy design pattern using role-based permission checks inspired by the Django REST Framework (DRF) Role Permission Policy identified in Part 1 of the design-pattern case study.

The Strategy pattern allows different permission rules to be implemented as interchangeable strategies behind a common interface.

## 2. Implementation Details

The implementation defines a common `PermissionStrategy` interface and three concrete strategies:

- **IsEmployer:** Grants permission when the user's role is `employer`.
- **IsEmployee:** Grants permission when the user's role is `employee`.
- **IsJobCreator:** Grants permission when the user owns the requested job.

The `check_permission()` function delegates the authorization decision to the selected strategy.

This is a standalone cross-language reproduction of the permission behavior, not a complete Django REST Framework implementation.

## 3. Files

| File | Purpose |
|---|---|
| `main.py` | Strategy interface, concrete strategies, and demonstration |
| `test_runner.py` | Tests for the three permission strategies |
| `README.md` | Implementation documentation and measured metrics |

## 4. Requirements

- Python 3.13.15
- No external packages required

## 5. How to Run

Open PowerShell in this directory and execute:

```powershell
python main.py
```

The program demonstrates employer, employee, and job-creator permission checks.

## 6. How to Run Tests

Execute:

```powershell
python test_runner.py
```

The test runner checks whether the correct users are authorized and whether a non-owner or missing job is denied.

**Verified result:** 3 test groups passed, 0 failed.

## 7. Test Scenarios

1. **Employer permission:** An employer is allowed; an employee is denied.
2. **Employee permission:** An employee is allowed; an employer is denied.
3. **Job creator permission:** The job owner is allowed; another employer and a missing job are denied.

## 8. Design Pattern Structure

| Strategy role | Implementation |
|---|---|
| Strategy interface | `PermissionStrategy` |
| Concrete strategy | `IsEmployer` |
| Concrete strategy | `IsEmployee` |
| Concrete strategy | `IsJobCreator` |
| Strategy selection/delegation | `check_permission()` |

## 9. Measured Metrics

| Metric | Value |
|---|---|
| Language | Python |
| Runtime version | Python 3.13.15 |
| Source LOC (`main.py`, excluding blank and comment lines) | 27 |
| Maximum function cyclomatic complexity | 2 |
| Test groups passed | 3 |
| Test groups failed | 0 |
| Runtime measurements | 5 |
| Median observed execution time | 0.066214 seconds |

### Runtime Measurement Data

The program was executed five times locally using PowerShell and Python.

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.081325 |
| 2 | 0.062681 |
| 3 | 0.066215 |
| 4 | 0.075226 |
| 5 | 0.050059 |

The sorted measurements are 0.050059, 0.062681, 0.066215, 0.075226, and 0.081325 seconds. Therefore, the median observed execution time is **0.066214 seconds** based on the unrounded measurements.

**Measurement limitation:** Measurements were collected locally using PowerShell's `Measure-Command`. Each measurement includes Python process startup and application execution. These values should not be interpreted as pure Strategy-pattern execution time.

## 10. Cross-Language Comparison

This Python implementation is one of the language implementations for the Strategy pattern in the Part 3 cross-language case study.

The Java, JavaScript, and C++ implementations should use equivalent permission rules, inputs, and test scenarios. Their metrics should be measured separately before comparing implementation size, complexity, and runtime.
