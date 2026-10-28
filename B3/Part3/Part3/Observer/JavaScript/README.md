# Observer Pattern — JavaScript Implementation

## 1. Overview

This project implements the Observer design pattern in JavaScript, using a job portal notification scenario.

The Observer pattern defines a one-to-many dependency between objects. When a job is created, the registered observers are notified automatically.

## 2. Implementation Details

The implementation contains three main components:

- **JobService:** Maintains a list of observers and notifies them when a job is created.
- **EmailNotifier:** Receives job creation notifications and prints an email notification message.
- **AnalyticsTracker:** Receives job creation notifications and prints an analytics message.

The `JobService` class provides the `addObserver()`, `createJob()`, and `notifyObservers()` methods.

## 3. Files

| File | Purpose |
|---|---|
| `main.js` | Observer implementation and demonstration |
| `test_runner.js` | Tests for the Observer implementation |
| `README.md` | Documentation and measured metrics |

## 4. Requirements

- Node.js 24.22.1
- No external npm packages required

## 5. How to Run

Open PowerShell in this directory:

```powershell
node main.js
```

Expected output:

```text
Job created: Python Developer
Email notification: Python Developer
Analytics recorded: Python Developer
```

## 6. How to Run Tests

Execute:

```powershell
node test_runner.js
```

The test runner verifies single-observer notification, multiple-observer notification, and notification processing when no observers are registered.

**Verified result:** 3 tests passed, 0 failed.

## 7. Test Scenarios

1. **Single observer:** Verify that one registered observer receives the job title.
2. **Multiple observers:** Verify that both registered observers receive the same job title.
3. **No observers:** Verify that notification processing completes without an error when no observers are registered.

## 8. Design Pattern Structure

The implementation follows the Observer pattern:

- `JobService` acts as the subject.
- `EmailNotifier` and `AnalyticsTracker` act as concrete observers.
- Observers are registered using `addObserver()`.
- The subject notifies registered observers through `notifyObservers()`.

## 9. Measured Metrics

| Metric | Value |
|---|---|
| Language | JavaScript |
| Runtime version | Node.js 24.22.1 |
| Source LOC (`main.js`, excluding blank and comment lines) | 34 |
| Maximum function cyclomatic complexity | 2 |
| Test cases passed | 3 |
| Test cases failed | 0 |
| Runtime measurements | 5 |
| Median observed execution time | 0.082355 seconds |

### Runtime Measurement Data

The program was executed five times locally using PowerShell and Node.js.

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.082355 |
| 2 | 0.082641 |
| 3 | 0.065058 |
| 4 | 0.068358 |
| 5 | 0.142585 |

The sorted measurements are 0.065058, 0.068358, 0.082355, 0.082641, and 0.142585 seconds. The median is **0.082355 seconds**.

**Measurement limitation:** Each measurement includes Node.js process startup and application execution. It excludes installation time. These values should not be interpreted as the pure execution time of the Observer pattern.

## 10. Cross-Language Comparison

This JavaScript implementation serves as one of the four language implementations for the Observer pattern in the Part 3 cross-language case study.

The equivalent Python, Java, and C++ implementations should use the same notification scenarios and equivalent inputs and outputs. Their metrics should be measured and recorded separately before comparing implementation size, complexity, and runtime.

## 11. Measured Metrics

| Metric | Value |
|---|---|
| Language | JavaScript |
| Runtime version | Node.js 24.22.1 |
| Source LOC (implementation only) | 34 |
| Maximum function cyclomatic complexity | 2 |
| Test cases passed | 3 |
| Test cases failed | 0 |
| Runtime measurements | 5 |
| Median observed execution time | 0.082355 seconds |

### Runtime Measurement Data

The program was executed five times locally using Node.js on Windows.

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.082355 |
| 2 | 0.082641 |
| 3 | 0.065058 |
| 4 | 0.068358 |
| 5 | 0.142585 |

The sorted measurements are 0.065058, 0.068358, 0.082355, 0.082641, and 0.142585 seconds. Therefore, the median observed execution time is **0.082355 seconds**.

**Measurement limitation:** Measurements were collected locally using PowerShell and `System.Diagnostics.Stopwatch`. Each measurement includes Node.js process startup and application execution. The results should not be interpreted as pure Observer-pattern execution time.

### Test Summary

The following test scenarios passed:

- Single observer receives a notification.
- Multiple observers receive the notification.
- No observers are registered, and notification processing completes without an error.

**Test result:** 3 passed, 0 failed.

### Cross-Language Comparison

This implementation provides the JavaScript reference for the Observer pattern. Equivalent implementations in Python, Java, and C++ should use the same notification scenarios and equivalent inputs and outputs. Record all language measurements separately before comparing performance.
