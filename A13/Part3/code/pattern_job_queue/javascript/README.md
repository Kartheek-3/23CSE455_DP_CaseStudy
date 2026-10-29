# Job Queue: JavaScript

- Production code: `jobQueue.js`
- Test runner: `jobQueue.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_job_queue/javascript/`:

```
node jobQueue.test.js ../../../test-cases/job_queue.txt
```

**Language notes:** Any thrown value counts as a failed attempt (there are no checked or typed exceptions to filter on).
