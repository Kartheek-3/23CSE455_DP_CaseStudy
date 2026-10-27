# Router: C++

- Production code: `nirax.hpp`
- Test runner: `nirax.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_router/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test nirax.test.cpp
build/test ../../../test-cases/router.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `Resolved` has a `matched` flag instead of a nullable route; the standard library has no split, so segments are split by hand.
