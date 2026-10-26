# Cache-Aside: C++

- Production code: `federated_instance_service.hpp`
- Test runner: `federated_instance_service.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_cache_aside/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test federated_instance_service.test.cpp
build/test ../../../test-cases/cache_aside.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Known-missing is an empty `std::optional<Instance>` stored in the map; repository and cache are injected by reference.
