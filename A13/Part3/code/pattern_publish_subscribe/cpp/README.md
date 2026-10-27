# Publish-Subscribe: C++

- Production code: `event_bus.hpp`
- Test runner: `event_bus.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_publish_subscribe/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test event_bus.test.cpp
build/test ../../../test-cases/publish_subscribe.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Handlers are `std::function`, which cannot be compared, so `subscribe` returns a token for `unsubscribe`; JSON is built by concatenation.
