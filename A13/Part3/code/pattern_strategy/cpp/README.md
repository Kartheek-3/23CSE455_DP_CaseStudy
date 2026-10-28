# Strategy: C++

- Production code: `log_manager.hpp`
- Test runner: `log_manager.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_strategy/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test log_manager.test.cpp
build/test ../../../test-cases/strategy.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Abstract base class with a pure virtual `write`; the backend is held through `std::shared_ptr`, so swapping it also settles ownership and lifetime. A null pointer is rejected explicitly.
