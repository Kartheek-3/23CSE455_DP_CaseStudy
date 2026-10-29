# Adapter: C++

- Production code: `telemetry.hpp`
- Test runner: `telemetry.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_adapter/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test telemetry.test.cpp
build/test ../../../test-cases/adapter.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Virtual functions cannot be templates, so `startSpan` is fixed to `std::string` instead of a generic return type like the TypeScript original; the closure is a `std::function`.
