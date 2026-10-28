# Strategy Pattern — JavaScript Implementation

## 1. Overview

This project implements the Strategy design pattern using role-based permission checks inspired by the DRF Role Permission Policy identified in Part 1 of the design-pattern case study.

The Strategy pattern allows different permission rules to be implemented as interchangeable strategies.

## 2. Implementation Details

Three concrete strategies are implemented:

- **IsEmployer:** Grants permission when the user's role is `employer`.
- **IsEmployee:** Grants permission when the user's role is `employee`.
- **IsJobCreator:** Grants permission when the user owns the requested job.

The `checkPermission()` function delegates the permission decision to the selected strategy.

This is a standalone cross-language reproduction of the permission behavior, not a complete Django REST Framework implementation.

## 3. Files

| File | Purpose |
|---|---|
| `main.js` | Permission strategies and demonstration |
| `test_runner.js` | Tests for the three permission strategies |
| `README.md` | Implementation documentation and measured metrics |

## 4. Requirements

- Node.js v24.22.1
- No external packages required; tests use Node.js's built-in `node:assert/strict` module.

## 5. How to Run

Run the demonstration:

```powershell
node main.js
```

Run the tests:

```powershell
node test_runner.js
```

## 6. Test Scenarios

The test runner covers three groups:

1. **Employer permission:** Employer allowed; employee denied.
2. **Employee permission:** Employee allowed; employer denied.
3. **Job creator permission:** Job owner allowed; another employer and a missing job denied.

**Verified test result:** 3 test groups passed, 0 failed.

## 7. Design Pattern Structure

| Strategy role | Implementation |
|---|---|
| Concrete strategy | `IsEmployer` |
| Concrete strategy | `IsEmployee` |
| Concrete strategy | `IsJobCreator` |
| Strategy delegation | `checkPermission()` |

JavaScript uses a common method name, `hasPermission()`, across the concrete strategies rather than a separately declared interface.

## 8. Measured Metrics

| Metric | Value |
|---|---|
| Language | JavaScript |
| Runtime | Node.js v24.22.1 |
| Source LOC (`main.js`, excluding blank and comment lines) | 31 |
| Maximum function cyclomatic complexity | 2 |
| Test groups passed | 3 |
| Test groups failed | 0 |
| Runtime measurements | 5 |
| Median observed execution time | 0.108211 seconds |

### Runtime Measurement Data

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.095221 |
| 2 | 0.119298 |
| 3 | 0.143514 |
| 4 | 0.085247 |
| 5 | 0.108211 |

The sorted measurements are 0.085247, 0.095221, 0.108211, 0.119298, and 0.143514 seconds. The median is **0.108211 seconds**.

**Measurement limitation:** The timings were collected locally using PowerShell's `Measure-Command`. They include Node.js startup and program execution. They are not pure measurements of Strategy-pattern execution time.

## 9. Cross-Language Comparison

This implementation is part of the Part 3 cross-language Strategy pattern case study. The Python and Java implementations reproduce the same permission rules.

Runtime comparisons should be interpreted cautiously because they include each runtime's process startup overhead. Implementation size and complexity are also affected by language syntax and conventions.
