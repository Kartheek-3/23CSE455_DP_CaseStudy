# Observer: C++

- Production code: `preferences_manager.hpp`
- Test runner: `preferences_manager.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_observer/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test preferences_manager.test.cpp
build/test ../../../test-cases/observer.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `std::function` objects cannot be compared, so `on` returns an integer handle that `off` takes; notification runs over a copy of the listener list.
