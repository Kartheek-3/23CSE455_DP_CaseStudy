# Job Queue: Java

- Production code: `JobQueue.java`
- Test runner: `JobQueueTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_job_queue/java/`:

```
javac -d build *.java
java -cp build JobQueueTest ../../../test-cases/job_queue.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Processor is a `Function<Job,String>`; a failing attempt is any `RuntimeException`; `Job` and `JobResult` are records.
