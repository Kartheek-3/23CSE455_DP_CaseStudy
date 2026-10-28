# Job Queue: Python

- Production code: `job_queue.py`
- Test runner: `test_job_queue.py` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_job_queue/python/`:

```
python3 -B test_job_queue.py ../../../test-cases/job_queue.txt
```

**Language notes:** Processor is any callable; only `RuntimeError` counts as a failed attempt, other exception types would propagate and stop the run.
