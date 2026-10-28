# Repository: C++

- Production code: `repository.hpp`
- Test runner: `repository.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_repository/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test repository.test.cpp
build/test ../../../test-cases/repository.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `MiRepository<Base>` is a class template deriving from the repository, so the mixin is resolved at compile time; entities are `std::map<string,string>`.
