# Service Layer: C++

- Production code: `announcement_service.hpp`
- Test runner: `announcement_service.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_service_layer/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test announcement_service.test.cpp
build/test ../../../test-cases/service_layer.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Collaborators are abstract classes held by reference; the repository's `find` returns a non-owning raw pointer (null when missing) and the read flag is a `std::optional<bool>`.
