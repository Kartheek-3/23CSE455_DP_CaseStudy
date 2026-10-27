# Dynamic Guard Factory — Python

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

`role_guard_factory.py` contains the factory and the generated guard.

The factory function:

```text
create_guard(...)
```

creates a guard configured with the supplied allowed roles.

The returned guard accepts:

```text
user_role
```

and performs the role-membership check.

NestJS, GraphQL, session handling, database access, and other framework-specific dependencies from the original application are intentionally omitted. The authorization behavior represented by the selected pattern is preserved.

## Test

`test_role_guard_factory.py` contains the seven shared test cases used for the cross-language implementations.

Run:

```bash
python test_role_guard_factory.py
```

Expected result:

```text
RESULT: 7 passed, 0 failed
```

## Runtime Environment

Runtime: Python

Version used for the final submission, recorded from `python --version`:

```text
Python 3.11.9
```

## Timing

The measured command was:

```bash
python test_role_guard_factory.py
```

Timing includes Python process startup, module loading, and execution of the test program.

Procedure:

1. Compile/validate the Python source before measurement.
2. Execute one warmup run.
3. Execute five measured runs.
4. Record each process time.
5. Report the median of the five measurements.

Raw timing evidence is stored in `timing_raw.csv`.

### Measured runs

| Run | Process time (ms) |
|----:|------------------:|
| 1 | 41.5076 |
| 2 | 33.0769 |
| 3 | 34.6300 |
| 4 | 34.0279 |
| 5 | 34.3508 |

### Median process time

**34.3508 ms**

## Limitations

This is a small cross-language reproduction of the selected pattern instance. It does not reproduce the complete NestJS application or its framework-specific execution environment.

The implementation does not perform database access, GraphQL request handling, session lookup, or other application-specific operations.