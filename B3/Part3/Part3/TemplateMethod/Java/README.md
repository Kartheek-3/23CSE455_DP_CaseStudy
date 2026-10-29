# Template Method Pattern — Java Implementation

## 1. Overview

This implementation reproduces the core structure of the GraphQL Mutation Pipeline identified in the original Django Job Portal case study.

The template method follows this sequence:

1. Check permissions.
2. Execute the mutation hook.
3. Convert permission-denial exceptions into an error payload.

This is a standalone Java reproduction, not a direct implementation using GraphQL or Django.

## 2. Implementation Structure

| Component | Responsibility |
|---|---|
| `MutationMixin` | Defines the fixed mutation workflow |
| `mutate()` | Template method |
| `checkPermissions()` | Checks permission and raises an exception when denied |
| `resolveMutation()` | Hook implemented by subclasses |
| `CreateJobMutation` | Implements job creation |
| `UpdateJobMutation` | Implements job update |
| `PermissionDeniedError` | Represents permission denial |

## 3. Files

- `Main.java` — Template Method implementation and demonstration
- `TestRunner.java` — Tests for the mutation workflow
- `README.md` — Documentation and measured metrics

## 4. Requirements

- OpenJDK 25.0.5.0.2 LTS
- No external dependencies required

## 5. How to Compile and Run

```powershell
javac Main.java TestRunner.java
java Main
```

## 6. How to Run Tests

```powershell
java -ea TestRunner
```

**Verified result:** 3 tests passed, 0 failed.

The tests cover successful job mutation, successful update mutation, and permission denial returning an error payload.

## 7. Measured Metrics

| Metric | Result |
|---|---|
| Language | Java |
| Runtime version | OpenJDK 25.0.5.0.2 LTS |
| Source LOC (`Main.java`, excluding blank and comment lines) | 40 |
| Tests passed | 3 |
| Tests failed | 0 |
| Runtime measurements | 5 |
| Median observed runtime | 0.073920 seconds |
| Minimum observed runtime | 0.066730 seconds |
| Maximum observed runtime | 0.099484 seconds |

### Runtime Measurement Data

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.099484 |
| 2 | 0.066730 |
| 3 | 0.070765 |
| 4 | 0.073921 |
| 5 | 0.074823 |

The median is **0.073920 seconds** when rounded to six decimal places.

**Measurement limitation:** Times were collected using PowerShell's `Measure-Command`. They include JVM startup and program execution, but exclude compilation. They do not represent pure Template Method execution time.

Maximum cyclomatic complexity has not been independently measured.

## 8. Design Pattern Summary

The Template Method pattern defines the workflow in a base class and delegates a customizable operation to subclasses. Here, `mutate()` preserves the permission-checking, mutation, and permission-error-handling sequence while subclasses implement `resolveMutation()`.

The implementation is inspired by the original GraphQL Mutation Pipeline, whose hook is called `resolve_mutation()`.
