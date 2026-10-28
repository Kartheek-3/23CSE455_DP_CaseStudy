\# Producer–Consumer — Python



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



\### `producer\_consumer.py`



Contains:



\- `Job` — represents an email job.

\- `Producer` — adds jobs to the shared queue.

\- `Consumer` — removes and processes jobs from the queue.



The consumer returns a deterministic processing message rather than performing an external email operation.



\### `test\_producer\_consumer.py`



Tests the shared cross-language fixture:



1\. SENDGRID job for `alice@example.com`

2\. MAILTRAP job for `bob@example.com`

3\. SENDGRID job for `charlie@example.com`

4\. Queue is empty after all jobs are processed



Expected result:



```text

RESULT: 4 passed, 0 failed

```



\## Run



From this directory:



```powershell

python test\_producer\_consumer.py

```



\## Validation



The implementation was syntax-checked with:



```powershell

python -m py\_compile producer\_consumer.py

```



Generated `\_\_pycache\_\_` files were removed after validation.



\## Environment



\- Python: 3.11.9

\- Operating system: Windows

\- Standard library only

\- No external dependencies



\## Timing



Timing was measured using the test command after validation.



Procedure:



1\. Validate the Python implementation.

2\. Execute one warmup run.

3\. Execute five measured runs.

4\. Record each process duration.

5\. Report the median of the five measured runs.



Command:



```powershell

Measure-Command { python test\_producer\_consumer.py > $null }

```



The timing includes Python process startup, module loading, and test execution. Compilation/validation time is excluded.



Raw measurements are stored in `timing\_raw.csv`.



\### Measured runs



| Run | Time (ms) |

|----:|----------:|

| 1 | 72.5676 |

| 2 | 62.5046 |

| 3 | 62.4852 |

| 4 | 61.2965 |

| 5 | 75.2782 |



\*\*Median: 62.5046 ms\*\*



\## Limitations



\- The original BullMQ/Redis infrastructure is not reproduced.

\- No real email service is contacted.

\- The implementation uses an in-memory FIFO queue.

\- Concurrency and asynchronous worker scheduling from the original application are reduced to deterministic sequential processing.

\- The implementation is intended to preserve the core Producer–Consumer structure and observable behavior relevant to the cross-language comparison.

