# Template Method: C++

- Production code: `chart.hpp`
- Test runner: `chart.test.cpp` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_template_method/cpp/`:

```
mkdir -p build
g++ -std=c++17 -Wall -Wextra -o build/test chart.test.cpp
build/test ../../../test-cases/template_method.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `tick` is a non-virtual public method calling protected pure virtual hooks; an abstract `Chart` cannot be instantiated, and the hooks are not part of the public interface.
