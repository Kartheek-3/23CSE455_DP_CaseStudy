# Plugin Architecture: C++

- Production code: `plugin_host.hpp`
- Test runner: `plugin_host.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_plugin_architecture/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test plugin_host.test.cpp
build/test ../../../test-cases/plugin_architecture.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Handlers are `std::function` values the host owns; an exception thrown from `setup` propagates through `install` and handlers added before it remain registered.
