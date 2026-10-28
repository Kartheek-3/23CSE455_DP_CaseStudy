# Proxy: C++

- Production code: `analytics_proxy.hpp`
- Test runner: `analytics_proxy.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_proxy/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test analytics_proxy.test.cpp
build/test ../../../test-cases/proxy.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** The proxy owns the real subject through `std::unique_ptr` (set by move), so the subject's lifetime is tied to the proxy; there is no automatic null check, it is written out.
