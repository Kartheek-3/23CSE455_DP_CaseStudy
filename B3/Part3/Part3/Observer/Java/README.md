# Observer Pattern — Java Implementation

## 1. Overview

This project implements the **Observer Design Pattern** in Java. The pattern establishes a one-to-many dependency between a subject and its observers. When the subject generates an event, all registered observers are notified automatically.

## 2. Project Structure

```text
Java/
├── Main.java
├── TestRunner.java
└── README.md
```

- **Main.java** — Contains the Observer pattern implementation and demonstration.
- **TestRunner.java** — Contains tests for observer notification behavior.
- **README.md** — Documents the implementation and test results.

## 3. Design Components

| Component | Responsibility |
|---|---|
| `JobObserver` | Defines the observer notification interface. |
| `EmailNotifier` | Displays an email-style notification when a job is created. |
| `AnalyticsTracker` | Displays an analytics event when a job is created. |
| `JobService` | Acts as the subject, registers observers, and notifies them. |
| `TestRunner` | Runs tests for single, multiple, and zero observers. |

## 4. How It Works

1. `JobService` maintains a list of registered observers.
2. Observers register through `addObserver()`.
3. When a job is created, `JobService` iterates through the observers.
4. Each observer receives the job title through `onJobCreated()`.
5. Different observers can respond to the same event independently.

## 5. Sample Output

```text
Job created: Python Developer
Email notification: Python Developer
Analytics recorded: Python Developer
```

## 6. Test Cases

| Test | Expected behavior |
|---|---|
| Single observer | One registered observer receives the job notification. |
| Multiple observers | Both registered observers receive the notification. |
| No observers | Notification processing completes without an error. |

### Test Results

The three test cases were run, and the observed output was:

```text
PASS: Single observer
PASS: Multiple observers
PASS: No observers
All Observer tests passed.
```

## 7. Running the Program

Compile the Java files:

```bash
javac Main.java TestRunner.java
```

Run the demonstration:

```bash
java Main
```

Run the tests:

```bash
java TestRunner
```

## 8. Advantages

- Reduces direct coupling between the subject and concrete observers.
- Allows new observers to be added without changing the subject's notification loop.
- Supports multiple independent reactions to a job creation event.

## 9. Limitations

- The current implementation does not provide observer removal.
- An exception in one observer could prevent later observers from being notified.
- The implementation is a simplified demonstration, not a production notification system.

## 10. Cross-Language Study

This Java implementation serves as the Observer pattern reference for the Part 3 cross-language study. Equivalent implementations will be created in Python, JavaScript, and C++, using equivalent inputs, outputs, and test scenarios.

Performance metrics, source lines of code, cyclomatic complexity, runtime versions, and benchmark results will be recorded separately after measurement.

## 11. Measured Metrics

| Metric | Value |
|---|---|
| Language | Java |
| JDK version | OpenJDK 25.0.5.0.2 (Microsoft Build) |
| Source LOC (implementation only) | 40 |
| Maximum function cyclomatic complexity | 2 |
| Test cases passed | 3 |
| Test cases failed | 0 |
| Runtime measurements | 5 |
| Median observed execution time | 0.098713 seconds |

### Runtime Measurement Data

The program was executed five times locally using OpenJDK on Windows. The measured execution times were:

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.093850 |
| 2 | 0.094828 |
| 3 | 0.098713 |
| 4 | 0.098753 |
| 5 | 0.124399 |

The sorted measurements are 0.093850, 0.094828, 0.098713, 0.098753, and 0.124399 seconds. Therefore, the median observed execution time is **0.098713 seconds**.

**Measurement limitation:** These measurements were collected locally using PowerShell and `System.Diagnostics.Stopwatch`. Each measurement includes JVM startup and application execution, but excludes compilation. Therefore, the results should not be interpreted as the pure execution time of the Observer pattern. For meaningful cross-language comparison, use a consistent measurement procedure and document differences in runtime and process startup overhead.

### Test Summary

The following test scenarios passed:

- Single observer receives a notification.
- Multiple observers receive the notification.
- No observers are registered, and notification processing completes without an error.

**Test result:** 3 passed, 0 failed.

### Cross-Language Comparison

This implementation serves as the Java reference implementation of the Observer pattern. Equivalent implementations in Python, JavaScript, and C++ should use the same notification scenarios and equivalent inputs and outputs. Record their metrics separately before comparing implementation size, complexity, and runtime.

