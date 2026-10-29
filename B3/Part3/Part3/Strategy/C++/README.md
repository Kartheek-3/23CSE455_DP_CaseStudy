# Strategy Pattern — C++ Implementation

## 1. Overview

This project implements the Strategy design pattern using role-based permission checks inspired by the Django REST Framework (DRF) Role Permission Policy identified in Part 1 of the design-pattern case study.

The Strategy pattern allows different permission rules to be implemented as interchangeable strategies behind a common interface.

The C++ implementation uses an abstract base class, virtual functions, and runtime polymorphism to delegate authorization decisions to the selected strategy.

This is a standalone cross-language reproduction of the permission behavior, not a complete Django REST Framework implementation.

## 2. Implementation Details

The implementation defines a common `PermissionStrategy` interface and three concrete strategies:

- **IsEmployer:** Grants permission when the user's role is `employer`.
- **IsEmployee:** Grants permission when the user's role is `employee`.
- **IsJobCreator:** Grants permission when the user owns the requested job.

The `check_permission()` function delegates the authorization decision to the selected strategy.

The implementation uses `User` and `Job` structures to represent data that was represented by dictionaries in Python. Null pointers represent missing users or jobs.

## 3. Files

| File | Purpose |
|---|---|
| `main.cpp` | Strategy interface, concrete strategies, and demonstration |
| `test_runner.cpp` | Intended test runner for the three permission strategies |
| `README.md` | Implementation documentation and measured metrics |

## 4. Requirements

- GCC C++ compiler
- C++17 or later
- Visual Studio Code or another C++ development environment
- No external C++ libraries required

Compiler: GCC (MSYS2 build), version 16.2.0.

## 5. How to Run

Open PowerShell in this directory and execute the following commands.

### Compile

```powershell
g++ -std=c++17 -O2 main.cpp -o main.exe
```

### Execute

```powershell
.\main.exe
```

Observed output:

```text
Employer permission: true
Employee permission: true
Job creator permission: true
```

## 6. How to Run Tests

Compile the test runner:

```powershell
g++ -std=c++17 -O2 test_runner.cpp -o test_runner.exe
```

Execute the test runner:

```powershell
.\test_runner.exe
```

The current observed output was:

```text
Employer permission: true
Employee permission: true
Job creator permission: true
```

This output confirms that the demonstration ran, but it does not verify the individual test assertions. The test runner should be checked to ensure it contains the intended test functions and assertions before recording final test counts.

## 7. Test Scenarios

The intended test suite covers three scenarios:

1. **Employer permission:** An employer is allowed; an employee is denied.
2. **Employee permission:** An employee is allowed; an employer is denied.
3. **Job creator permission:** The job owner is allowed; another employer and a missing job are denied.

The intended test suite contains six assertions across these three test groups.

## 8. Design Pattern Structure

| Strategy role | Implementation |
|---|---|
| Strategy interface | `PermissionStrategy` |
| Concrete strategy | `IsEmployer` |
| Concrete strategy | `IsEmployee` |
| Concrete strategy | `IsJobCreator` |
| Strategy selection/delegation | `check_permission()` |
| User data | `User` structure |
| Job data | `Job` structure |

## 9. Measured Metrics

| Metric | Value |
|---|---|
| Language | C++ |
| Compiler | GCC (MSYS2 build) |
| Compiler version | 16.2.0 |
| C++ standard | C++17 |
| Source LOC (`main.cpp`, excluding blank and comment-only lines) | 61 |
| Maximum function cyclomatic complexity | Pending verification |
| Test groups passed | Pending verification |
| Test groups failed | Pending verification |
| Runtime measurements | 5 |
| Median observed execution time | 0.023732 seconds |

### Runtime Measurement Data

The program was compiled with GCC using C++17 and `-O2`, then executed five times using PowerShell's `Measure-Command`.

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.730366 |
| 2 | 0.023118 |
| 3 | 0.019413 |
| 4 | 0.023909 |
| 5 | 0.023732 |

The median observed execution time was **0.023732 seconds**, or approximately 23.732 milliseconds.

### Measurement Procedure

1. Compile `main.cpp` with `g++ -std=c++17 -O2`.
2. Execute the compiled program five times.
3. Measure each execution using PowerShell's `Measure-Command`.
4. Sort the five recorded measurements and select the middle value as the median.

The measurements include process startup and application execution. They do not represent the isolated execution time of the Strategy pattern itself.

The first measurement, 0.730366 seconds, is substantially higher than the remaining four measurements. It is retained in the dataset rather than discarded. The median is less sensitive to this unusually high observation than the arithmetic mean.

### Source Lines of Code

The reported count is 61 lines, excluding blank lines and lines beginning with common C++ comment markers according to the PowerShell command used.

This is a practical line-based count rather than a full lexical analysis of C++ source code. Use the same counting convention for all language implementations.

### Cyclomatic Complexity

The maximum function cyclomatic complexity has not yet been verified with an automated tool.

Use the same definition and measurement method across the Python, Java, JavaScript, and C++ implementations. If complexity is calculated manually, document the decision-point counting convention and label the result as a manual estimate.

### Test Summary

The demonstration output was observed successfully. However, the test runner's current output does not show the expected `PASS` messages or confirm assertion execution.

Record the final number of passing and failing test groups only after verifying that `test_runner.cpp` contains and executes the intended tests.

## 10. Cross-Language Comparison

This C++ implementation is one of the language implementations for the Strategy pattern in the Part 3 cross-language case study.

The Python, Java, JavaScript, and C++ implementations should use equivalent permission rules, inputs, and test scenarios.

Their source size, cyclomatic complexity, test results, and runtime should be measured separately. Comparisons should account for compiler optimization, interpreter startup, process-launch overhead, and differences in the measurement environment.
