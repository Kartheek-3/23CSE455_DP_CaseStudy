# Strategy Pattern — Java Implementation

## 1. Overview

This project implements the Strategy design pattern using role-based permission checks inspired by the DRF Role Permission Policy identified in Part 1 of the design-pattern case study.

The Strategy pattern allows different permission rules to be implemented as interchangeable strategies through a common interface.

## 2. Implementation Details

The implementation defines a common `PermissionStrategy` interface and three concrete strategies:

- **IsEmployer:** Grants permission when the user's role is `employer`.
- **IsEmployee:** Grants permission when the user's role is `employee`.
- **IsJobCreator:** Grants permission when the user owns the requested job.

The `PermissionChecker` delegates the authorization decision to the selected strategy.

This is a standalone cross-language reproduction of the permission behavior, not a complete Django REST Framework implementation.

## 3. Files

| File | Purpose |
|---|---|
| `Main.java` | Strategy interface, concrete strategies, and demonstration |
| `TestRunner.java` | Tests for the three permission strategies |
| `README.md` | Implementation documentation and measured metrics |

## 4. Requirements

- OpenJDK 25.0.5.0.2 LTS
- No external dependencies required

## 5. How to Compile and Run

Open PowerShell in this directory and execute:

```powershell
javac Main.java TestRunner.java
java Main
```

The program demonstrates employer, employee, and job-creator permission checks.

## 6. How to Run Tests

Execute:

```powershell
java TestRunner
```

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
| Strategy selection/delegation | `PermissionChecker.check()` |

## 9. Measured Metrics

| Metric | Value |
|---|---|
| Language | Java |
| Runtime version | OpenJDK 25.0.5.0.2 LTS |
| Source LOC (`Main.java`, excluding blank and comment lines) | 46 |
| Maximum function cyclomatic complexity | 2 |
| Test groups passed | 3 |
| Test groups failed | 0 |
| Runtime measurements | 5 |
| Median observed execution time | 0.083283 seconds |

### Runtime Measurement Data

The program was executed five times locally using PowerShell and OpenJDK.

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.112405 |
| 2 | 0.067040 |
| 3 | 0.077506 |
| 4 | 0.090123 |
| 5 | 0.083283 |

The sorted measurements are 0.067040, 0.077506, 0.083283, 0.090123, and 0.112405 seconds. Therefore, the median observed execution time is **0.083283 seconds**.

**Measurement limitation:** Measurements were collected locally using PowerShell's `Measure-Command`. Each measurement includes JVM startup and application execution but excludes compilation. These values should not be interpreted as pure Strategy-pattern execution time.

## 10. Cross-Language Comparison

This Java implementation is one of the language implementations for the Strategy pattern in the Part 3 cross-language case study.

The Python, JavaScript, and C++ implementations should use equivalent permission rules, inputs, and test scenarios. Their metrics should be measured separately before comparing implementation size, complexity, and runtime.
