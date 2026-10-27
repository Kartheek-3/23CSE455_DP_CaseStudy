# Factory: C++

- Production code: `logging_factory.hpp`
- Test runner: `logging_factory.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_factory/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test logging_factory.test.cpp
build/test ../../../test-cases/factory.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** A free inline function returning `std::unique_ptr<LogBackend>`; the absent-versus-empty distinction is explicit in the type (`std::optional<std::string>`), which the other languages express with null or a sentinel.
