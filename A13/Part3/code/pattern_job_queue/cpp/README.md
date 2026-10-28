# Job Queue: C++

- Production code: `job_queue.hpp`
- Test runner: `job_queue.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_job_queue/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test job_queue.test.cpp
build/test ../../../test-cases/job_queue.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Only `std::runtime_error` counts as a failed attempt; the result is held in a `std::optional<std::string>` until a processor call succeeds.
