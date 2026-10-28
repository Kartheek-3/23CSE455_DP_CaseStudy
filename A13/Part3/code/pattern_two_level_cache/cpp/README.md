# Two-Level Cache: C++

- Production code: `redis_single_cache.hpp`
- Test runner: `redis_single_cache.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_two_level_cache/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test redis_single_cache.test.cpp
build/test ../../../test-cases/two_level_cache.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `std::optional<std::string>` makes absence part of the type; Redis is reached through a `RemoteStore&`, so the cache does not own it; `delete` is renamed `remove` because it is a keyword.
