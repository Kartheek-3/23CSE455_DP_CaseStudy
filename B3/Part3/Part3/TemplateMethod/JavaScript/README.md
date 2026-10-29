# Template Method Pattern — JavaScript Implementation

## 1. Overview

This implementation reproduces the core structure of the GraphQL Mutation Pipeline identified in the original Django Job Portal case study.

The workflow is:

1. Check permissions.
2. Execute the mutation hook.
3. Convert permission-denial exceptions into an error payload.

This is a standalone JavaScript reproduction, not a direct implementation using GraphQL or Django.

## 2. Implementation Structure

| Component | Responsibility |
|---|---|
| `MutationMixin` | Defines the fixed mutation workflow |
| `mutate()` | Template method |
| `checkPermissions()` | Checks permission |
| `resolveMutation()` | Hook overridden by subclasses |
| `CreateJobMutation` | Implements job creation |
| `UpdateJobMutation` | Implements job update |
| `PermissionDeniedError` | Represents permission denial |

## 3. Files

- `main.js` — Implementation and demonstration
- `test_runner.js` — Tests for the mutation workflow
- `README.md` — Documentation and measured metrics

## 4. Requirements

- Node.js v24.22.1
- No external dependencies required; tests use Node.js's built-in `node:assert/strict` module.

## 5. How to Run

```powershell id="1my1g4"
node main.js
```

Run tests:

```powershell id="v2m4jd"
node test_runner.js
```

## 6. Test Results

**Verified result:** 3 tests passed, 0 failed.

| Test | Expected behavior |
|---|---|
| Allowed mutation | Returns a successful job result |
| Update mutation | Returns a successful update result |
| Permission denial | Returns an error payload without executing the mutation |

## 7. Measured Metrics

| Metric | Result |
|---|---|
| Language | JavaScript |
| Runtime version | Node.js v24.22.1 |
| Source LOC (`main.js`, excluding blank and comment lines) | 38 |
| Tests passed | 3 |
| Tests failed | 0 |
| Runtime measurements | 5 |
| Median observed runtime | 0.089399 seconds |
| Minimum observed runtime | 0.064654 seconds |
| Maximum observed runtime | 0.171186 seconds |

### Runtime Measurement Data

| Run | Execution time (seconds) |
|---:|---:|
| 1 | 0.089399 |
| 2 | 0.064654 |
| 3 | 0.070864 |
| 4 | 0.102130 |
| 5 | 0.171186 |

The median is **0.089399 seconds**.

**Measurement limitation:** Times were collected locally using PowerShell's `Measure-Command`. They include Node.js startup and program execution, not just the Template Method logic.

Maximum cyclomatic complexity has not been independently measured.

## 8. Design Pattern Summary

The Template Method pattern defines a fixed workflow in a base class while allowing subclasses to customize a step. Here, `mutate()` controls permission checking, mutation execution, and permission-error handling, while subclasses implement `resolveMutation()`.

This implementation is inspired by the original GraphQL Mutation Pipeline and uses JavaScript's method overriding rather than a formal interface.
