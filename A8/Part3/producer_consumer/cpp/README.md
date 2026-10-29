\# Producer–Consumer — C++



\## Pattern



\*\*Producer–Consumer\*\*



This implementation reproduces the representative Producer–Consumer instance identified in the original project: asynchronous email processing through a shared queue.



The original application uses multiple producers to enqueue email jobs and a worker consumer to process jobs according to their job type. This reduced implementation preserves that producer–queue–consumer structure while removing application-specific infrastructure.



\## Source Correspondence



Original project:



\- Repository: https://github.com/karthikkishorkk/A9

\- Representative instance: Async Email Processing Queue

\- Producer sources:

&#x20; - `src/users/send-grid.service.ts`

&#x20; - `src/users/users.resolver.ts`

\- Consumer source:

&#x20; - `src/users/workers/email.worker.ts`



The original implementation uses a BullMQ email queue and a worker. This implementation replaces the external queue with an in-memory FIFO queue so that the core pattern can be reproduced without Redis, BullMQ, email services, or application infrastructure.



\## Reduced Problem



Producers create email jobs and enqueue them into a shared queue.



The consumer retrieves jobs in FIFO order and processes them according to their job type.



Supported job types:



\- `SENDGRID`

\- `MAILTRAP`



Processing is deterministic and does not send actual email.



\## Implementation



\### `producer\_consumer.cpp`



Contains:



\- `Job` — represents an email job.

\- `Producer` — adds jobs to the shared queue.

\- `Consumer` — removes and processes jobs from the queue.



The consumer returns a deterministic processing message rather than performing an external email operation.



\### `test\_producer\_consumer.cpp`



Tests the shared cross-language fixture:



1\. SENDGRID job for `alice@example.com`

2\. MAILTRAP job for `bob@example.com`

3\. SENDGRID job for `charlie@example.com`

4\. Queue is empty after all jobs are processed



\## Build



From this directory:



```powershell

g++ -std=c++17 -Wall -Wextra -pedantic test\_producer\_consumer.cpp -o test\_producer\_consumer.exe

```



\## Test



```powershell

.\\test\_producer\_consumer.exe

```



Expected result:



```text

RESULT: 4 passed, 0 failed

```



The executable is removed after testing so that generated binaries are not included in the repository.



\## Environment



\- Compiler: g++ (MSYS2) 14.2.0

\- Language standard: C++17

\- Operating system: Windows

\- No external dependencies



\## Timing



Timing was measured after compilation.



Procedure:



1\. Compile the C++ implementation.

2\. Execute one warmup run.

3\. Execute five measured runs.

4\. Record each process duration.

5\. Report the median of the five measured runs.



Command:



```powershell

Measure-Command { .\\test\_producer\_consumer.exe > $null }

```



The timing includes executable process startup and test execution. Compilation time is excluded.



Raw measurements are stored in `timing\_raw.csv`.



\### Measured runs



| Run | Time (ms) |

|----:|----------:|

| 1 | 20.4767 |

| 2 | 10.8259 |

| 3 | 10.8482 |

| 4 | 10.9623 |

| 5 | 10.1694 |



\*\*Median: 10.8482 ms\*\*



\## Limitations



\- The original BullMQ/Redis infrastructure is not reproduced.

\- No real email service is contacted.

\- The implementation uses an in-memory FIFO queue.

\- Concurrency and asynchronous worker scheduling from the original application are reduced to deterministic sequential processing.

\- The implementation is intended to preserve the core Producer–Consumer structure and observable behavior relevant to the cross-language comparison.

