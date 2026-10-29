# Observer Pattern — Python Implementation

## 1. Overview

This project implements the Observer Design Pattern in Python. The pattern allows a subject to notify multiple registered observers when an event occurs.

## 2. Project Structure

```text
Python/
├── main.py
├── test_runner.py
└── README.md
```

- `main.py` — Observer pattern implementation and demonstration.
- `test_runner.py` — Tests observer notification behavior.
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

1. `JobService` maintains a list of observers.
2. Observers register using `add_observer()`.
3. When a job is created, `notify_observers()` iterates over the registered observers.
4. Each observer receives the job title through `on_job_created()`.

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

All three tests were run successfully, according to the observed test output:

```text
PASS: Single observer
PASS: Multiple observers
PASS: No observers
All Observer tests passed.
```

## 7. Running the Program

Run the demonstration:

```bash
python main.py
```

Run the tests:

```bash
python test_runner.py
```

No third-party packages are required for this implementation.

## 8. Advantages

- Supports multiple observers without tightly coupling them to the subject.
- New observer types can be added without changing the notification loop.
- Separates event generation from event-handling behavior.

## 9. Limitations

- Observer removal is not implemented.
- An exception from one observer could prevent subsequent observers from receiving the event.
- This is a simplified implementation for a design pattern study.

## 10. Cross-Language Study

This implementation corresponds to the Java Observer implementation in the Part 3 study. Equivalent behavior and test scenarios will be used for JavaScript and C++.

## 11. Measured Metrics

Metrics will be recorded after measurement:

| Metric | Value |
|---|---|
| Python version | Pending measurement |
| Source LOC | Pending measurement |
| Maximum function cyclomatic complexity | Pending measurement |
| Test cases passed | 3 |
| Test cases failed | 0 |
| Median runtime | Pending measurement |

Runtime measurements must be collected using a documented, repeatable procedure. Results should not be invented or inferred from another language's measurements.

## 11. Measured Metrics

| Metric | Value |
|---|---|
| Python version | 3.13.15 |
| Source LOC (`main.py`) | 27 |
| Maximum function cyclomatic complexity | 2 |
| Test cases passed | 3 |
| Test cases failed | 0 |
| Runtime measurements | 5 |
| Median observed runtime | 0.064955 seconds |

### Runtime Measurement Data

The benchmark executed `main.py` five times using Python's `time.perf_counter()`. The measurements were:

| Run | Runtime (seconds) |
|---:|---:|
| 1 | 0.065402 |
| 2 | 0.060407 |
| 3 | 0.064955 |
| 4 | 0.067866 |
| 5 | 0.061053 |

The median observed runtime was **0.064955 seconds**.

**Measurement limitation:** Each measurement includes launching a Python subprocess and its startup overhead. The values should not be interpreted as the isolated execution time of the Observer pattern itself.

### Test Summary

All three test scenarios passed: single observer, multiple observers, and no observers.

### Cross-Language Study

This Python implementation mirrors the Java Observer example. The same scenarios and equivalent input/output behavior should be used for JavaScript and C++ to support a consistent comparison.
