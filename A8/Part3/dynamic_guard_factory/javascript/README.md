# Dynamic Guard Factory — JavaScript

## Pattern

Dynamic Guard Factory / Role-Based Guard Synthesis.

This implementation reproduces the role-based authorization behavior identified in the A9 project.

## Source

Original A9 source:

`Part2/code/src/flight/guards/roles.restrict.guard.ts`

The original implementation accepts a variable set of allowed roles and produces a guard that checks whether the current user's role belongs to that allowed set.

## Cross-Language Problem

The reduced problem is:

> Create a role-based authorization guard factory that accepts a set of allowed roles and produces a guard capable of determining whether a user's role is authorized.

### Input

- A set of allowed role names.
- A user role, which may be missing/null.

### Output

A boolean indicating whether the user is authorized.

### Rules

- A role present in the allowed-role set returns `true`.
- A role not present in the allowed-role set returns `false`.
- An empty allowed-role set returns `false`.
- A missing/null user role returns `false`.

## Implementation

`roleGuardFactory.js` contains the factory and the generated guard.

The factory function:

```text
createGuard(...)
```

creates a guard configured with the supplied allowed roles.

The returned guard accepts:

```text
userRole
```

and performs the role-membership check.

NestJS, GraphQL, session handling, database access, and other framework-specific dependencies from the original application are intentionally omitted. The authorization behavior represented by the selected pattern is preserved.

## Test

`testRoleGuardFactory.js` contains the seven shared test cases used for the cross-language implementations.

Run:

```bash
node testRoleGuardFactory.js
```

Expected result:

```text
RESULT: 7 passed, 0 failed
```

## Runtime Environment

Runtime: Node.js

Version used for the final submission, recorded from `node --version`:

```text
v22.12.0
```

## Timing

The measured command was:

```bash
node testRoleGuardFactory.js
```

Timing includes Node.js process startup, module loading, and execution of the test program.

Procedure:

1. Validate the JavaScript source before measurement.
2. Execute one warmup run.
3. Execute five measured runs.
4. Record each process time.
5. Report the median of the five measurements.

Raw timing evidence is stored in `timing_raw.csv`.

### Measured runs

| Run | Process time (ms) |
|----:|------------------:|
| 1 | 46.9358 |
| 2 | 38.3860 |
| 3 | 40.9674 |
| 4 | 46.3147 |
| 5 | 41.5423 |

### Median process time

**41.5423 ms**

## Limitations

This is a small cross-language reproduction of the selected pattern instance. It does not reproduce the complete NestJS application or its framework-specific execution environment.

The implementation does not perform database access, GraphQL request handling, session lookup, or other application-specific operations.