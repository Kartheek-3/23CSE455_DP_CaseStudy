# Observer Pattern — C++ Implementation

## 1. Overview

This project implements the Observer Design Pattern in C++. The pattern allows a subject to notify multiple registered observers when an event occurs.

The implementation uses an abstract base class, virtual functions, and runtime polymorphism to support observer notifications.

## 2. Project Structure

```text
C++/
├── main.cpp
├── test_runner.cpp
└── README.md
```

- `main.cpp` — Observer pattern implementation and demonstration.
- `test_runner.cpp` — Tests observer notification behavior.
- `README.md` — Documentation and measured results.

## 3. Design Components

| Component | Responsibility |
|---|---|
| `JobObserver` | Abstract interface defining the notification method. |
| `EmailNotifier` | Displays an email-style notification. |
| `AnalyticsTracker` | Displays an analytics event. |
| `JobService` | Registers observers and notifies them when a job is created. |
| `TestObserver` | Records received job titles for testing. |

## 4. How It Works

1. `JobService` maintains a collection of observer pointers using `std::vector`.
2. Observers register using `add_observer()`.
3. When a job is created, `notify_observers()` iterates over the registered observers.
4. Each observer receives the job title through `on_job_created()`.
5. Virtual functions enable different observer implementations to respond to the same event.

## 5. Sample Output

```text
Job created: Python Developer
Email notification: Python Developer
Analytics recorded: Python Developer
```

## 6. Test Cases

| Test | Expected behavior |
|---|---|
| Single observer | One observer receives the notification. |
| Multiple observers | Both observers receive the notification. |
| No observers | Notification processing completes without an error. |

### Test Results

All three test scenarios were executed successfully.

```text
PASS: Single observer
PASS: Multiple observers
PASS: No observers
All Observer tests passed.
```

| Result | Count |
|---|---:|
| Test cases passed | 3 |
| Test cases failed | 0 |

## 7. Running the Program

### Requirements

- GCC C++ compiler
- C++17-compatible compilation
- Visual Studio Code or another C++ development environment

### Compile and run the demonstration

Compile `main.cpp`:

```powershell
g++ -std=c++17 -O2 main.cpp -o main.exe
```

Run the program:

```powershell
.\main.exe
```

### Compile and run the tests

Compile `test_runner.cpp`:

```powershell
g++ -std=c++17 -O2 test_runner.cpp -o test_runner.exe
```

Run the tests:

```powershell
.\test_runner.exe
```

No third-party C++ libraries are required.

## 8. Advantages

- Supports multiple observers without tightly coupling them to the subject.
- New observer types can be added without modifying the notification loop.
- Separates event generation from event-handling behavior.
- Uses runtime polymorphism through virtual functions.
- Provides an extensible design for event-driven applications.

## 9. Limitations

- Observer removal is not implemented.
- Raw observer pointers require careful lifetime management.
- An exception from one observer could prevent subsequent observers from receiving the event.
- The implementation is simplified for a design pattern study.

## 10. Cross-Language Study

This implementation corresponds to the Python and Java Observer implementations in the Part 3 cross-language study.

Equivalent behavior and test scenarios are used to evaluate observer notification in different languages.

The comparison considers source lines of code, cyclomatic complexity, test results, and runtime measurements. Compiler or interpreter versions, build settings, and measurement procedures should be documented to support reproducibility.

## 11. Measured Metrics

| Metric | Value |
|---|---|
| Compiler | GCC (MSYS2 build) |
| Compiler version | 16.2.0 |
| C++ standard | C++17 |
| Source LOC (`main.cpp`) | 52 physical lines |
| Maximum function cyclomatic complexity | 2 (manual estimate) |
| Test cases passed | 3 |
| Test cases failed | 0 |
| Runtime measurements | 5 |
| Median observed runtime | 0.023461 seconds |

### Runtime Measurement Data

The benchmark executed the optimized `main.exe` five times using PowerShell's `Measure-Command`.

| Run | Runtime (seconds) |
|---:|---:|
| 1 | 0.964539 |
| 2 | 0.023412 |
| 3 | 0.021736 |
| 4 | 0.023503 |
| 5 | 0.023461 |

The median observed runtime was **0.023461 seconds** (approximately 23.461 milliseconds).

### Measurement Procedure

1. Compile the demonstration using GCC with C++17 and optimization level `-O2`.
2. Execute `main.exe` five times.
3. Measure each execution using PowerShell's `Measure-Command`.
4. Sort the five measurements and select the middle value as the median.

The benchmark includes process-launch overhead and program execution time. It does not measure the isolated execution time of the Observer pattern itself.

The first measurement, 0.964539 seconds, is substantially higher than the other four measurements. It is retained in the dataset rather than discarded. The median is less affected by this unusually high observation than the arithmetic mean.

**Reproducibility note:** Runtime results depend on the computer, operating system, system load, compiler, and measurement method. These results describe the observed run and should not be treated as a universal performance figure.

### Cyclomatic Complexity Method

The maximum function cyclomatic complexity is recorded as **2 (manual estimate)**, using the conventional rule of one plus the number of decision points. The notification loop in `JobService::notify_observers()` contributes one decision point.

This value has not been verified using an automated complexity-analysis tool.

### Test Summary

All three test scenarios passed:

1. Single observer notification.
2. Multiple observer notifications.
3. Notification processing with no registered observers.

The observed test result was three passing tests and zero failing tests.

### Cross-Language Study

This C++ implementation mirrors the Python Observer example. The same scenarios and equivalent input/output behavior should be used for JavaScript and other language implementations to support a consistent comparison.
