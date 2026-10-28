# Dynamic Guard Factory — C++

## Pattern

Dynamic Guard Factory

## Source correspondence

Representative source instance:

`src/flight/guards/roles.restrict.guard.ts`

The original implementation dynamically creates an authorization guard from a set of allowed roles. This reproduction preserves that factory behavior while removing NestJS, GraphQL, session, database, and dependency-specific code.

## Problem

Create a role-based authorization guard factory that accepts allowed roles and produces a guard that determines whether a user's role is authorized.

## Implementation

- `role_guard_factory.cpp` — pattern implementation
- `test_role_guard_factory.cpp` — seven-case shared test fixture
- `timing_raw.csv` — five measured execution times

The implementation uses a C++ callable guard. The factory captures the allowed roles and returns a guard that performs role-membership checking.

## Test cases

1. ADMIN allowed by `ADMIN, CREW`
2. CREW allowed by `ADMIN, CREW`
3. USER rejected by `ADMIN, CREW`
4. SECURITY rejected by `ADMIN, CREW`
5. Empty allowed-role set rejects ADMIN
6. USER allowed by `USER`
7. Missing/null user role rejected

## Build

```powershell
g++ -std=c++17 -Wall -Wextra -pedantic test_role_guard_factory.cpp -o test_role_guard_factory.exe
```

## Test

```powershell
.\test_role_guard_factory.exe
```

Expected result:

```text
RESULT: 7 passed, 0 failed
```

## Validation

The implementation was separately compiled with:

```powershell
g++ -std=c++17 -c role_guard_factory.cpp -o role_guard_factory.o
```

The generated object file was removed after validation.

## Environment

- Compiler: g++ 14.2.0 (MSYS2)
- Language standard: C++17
- Platform: Windows

## Timing

Compilation was performed before timing.

Procedure:

1. Compile the executable.
2. Run one warmup execution.
3. Run five measured executions using PowerShell `Measure-Command`.
4. Report the median of the five `TotalMilliseconds` values.

Timing command:

```powershell
Measure-Command { .\test_role_guard_factory.exe > $null }
```

Timing includes C++ executable process startup and test execution. Compilation is excluded.

Official measured values:

| Run | Process time (ms) |
|----:|------------------:|
| 1 | 17.1659 |
| 2 | 7.4782 |
| 3 | 9.3217 |
| 4 | 7.6309 |
| 5 | 7.2511 |

**Median: 7.6309 ms**

Raw measurements are stored in `timing_raw.csv`.

## Limitations

This is a reduced cross-language reproduction of the original pattern. Framework-specific behavior such as NestJS dependency injection, GraphQL execution context, session access, database lookup, and `mixin()` are intentionally removed so that the core pattern behavior can be reproduced consistently across Java, Python, JavaScript, and C++.