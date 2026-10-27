# Front Controller: C++

- Production code: `api_controller.hpp`
- Test runner: `api_controller.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_front_controller/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test api_controller.test.cpp
build/test ../../../test-cases/front_controller.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** The user is a `std::optional<std::string>`; the method is called `registerEndpoint` because `register` is a C++ keyword.
