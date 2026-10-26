# Job Queue: Federation Delivery Asynchronous Job Queue

**Why this instance:** Delivery of ActivityPub activities is the best-documented queue in the code: a producer, a worker that processes the job, retry settings and a skip rule.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Producer `QueueService` adds delivery jobs with a label built from the inbox URL, `deliverQueue.add` at packages/backend/src/core/QueueService.ts:166 (attempts default `?? 12` at 167) and `addBulk` at 210
- Worker `new Bull.Worker(QUEUE.DELIVER, ...)` calling the processor: packages/backend/src/queue/QueueProcessorService.ts:265-269
- Consumer `DeliverProcessorService.process(job)`: packages/backend/src/queue/processors/DeliverProcessorService.ts:53 (returns `'skip (blocked)'` for a blocked host)

**How the source shows the pattern:** The code that produces an activity only enqueues a job and returns; a separate worker takes jobs from the BullMQ queue and runs `process` on them, and BullMQ retries a failed job up to `deliverJobMaxAttempts` (12 by default).

**Caveats:** BullMQ and Redis provide the queue, persistence and retry mechanics. Misskey supplies the producer and the processor, so the model reimplements the queue itself to have something runnable.

**The small model:** `JobQueue.add` stores a job and returns its id; `run(processor)` takes jobs in FIFO order and retries a job when the processor throws, up to 12 attempts. `DeliverService` builds the label like the source (`https://` and `/inbox` removed), and `DeliverProcessor` skips blocked hosts, otherwise sends via a transport. Results are reported as `id:label:result@attempts`.

**Not modelled:** No delay or back-off between attempts, no concurrency, no persistence, and a single queue. Hosts ending in `.down` always fail and hosts ending in `.flaky` fail once; those are test-fake rules, not Misskey's.

**Shared test cases:** `Part3/test-cases/job_queue.txt` has 6 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
