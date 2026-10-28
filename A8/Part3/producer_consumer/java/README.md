# Producer–Consumer — Java

## Pattern

Producer–Consumer

## Source correspondence

Representative source instances:

- `src/users/send-grid.service.ts`
- `src/users/users.resolver.ts`
- `src/users/workers/email.worker.ts`

The original implementation has multiple producers that enqueue email jobs into a shared queue and a worker that consumes and processes those jobs according to job type.

This reproduction preserves the producer–consumer structure and FIFO processing behavior while removing NestJS, BullMQ, Redis, SendGrid, Mailtrap, database access, and network dependencies.

## Problem

Implement a producer–consumer system where producers enqueue email jobs and a consumer retrieves and processes them according to job type.

## Implementation

- `ProducerConsumer.java` — pattern implementation
- `ProducerConsumerTest.java` — shared test fixture
- `timing_raw.csv` — five measured execution times

The implementation uses a shared FIFO queue. Producers add jobs to the queue without processing them. The consumer retrieves the next job and processes it according to its type.

Supported job types:

- `SENDGRID`
- `MAILTRAP`

Processing is deterministic and does not perform actual email delivery.

## Test cases

The shared fixture contains three jobs:

1. SENDGRID → `alice@example.com` → Welcome
2. MAILTRAP → `bob@example.com` → Reset: 1234
3. SENDGRID → `charlie@example.com` → Flight confirmed

The tests verify:

1. First job is processed by SENDGRID.
2. Second job is processed by MAILTRAP.
3. Third job is processed by SENDGRID.
4. Queue is empty after all jobs are processed.

Expected result:

```text
RESULT: 4 passed, 0 failed
```

## Build

```powershell
javac ProducerConsumer.java ProducerConsumerTest.java
```

## Test

```powershell
java ProducerConsumerTest
```

## Environment

- Java: 25.0.1 LTS
- javac: 25.0.1
- Platform: Windows

## Timing

Compilation was performed before timing.

Procedure:

1. Compile the Java implementation.
2. Run one warmup execution.
3. Run five measured executions using PowerShell `Measure-Command`.
4. Report the median of the five `TotalMilliseconds` values.

Timing command:

```powershell
Measure-Command { java ProducerConsumerTest > $null }
```

Timing includes JVM process startup, class loading, and test execution. Compilation is excluded.

Official measured values:

| Run | Process time (ms) |
|----:|------------------:|
| 1 | 94.4393 |
| 2 | 100.3998 |
| 3 | 80.4992 |
| 4 | 84.6274 |
| 5 | 112.9199 |

**Median: 94.4393 ms**

Raw measurements are stored in `timing_raw.csv`.

## Limitations

This is a reduced cross-language reproduction of the original pattern. Framework-specific behavior such as NestJS dependency injection, BullMQ/Redis queue infrastructure, SendGrid/Mailtrap APIs, database access, and network communication are intentionally removed so that the core producer–consumer behavior can be reproduced consistently across Java, Python, JavaScript, and C++.