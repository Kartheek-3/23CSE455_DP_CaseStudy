# Observer in C++20

Based on JUnit's `TestExecutionListener` and `CompositeTestExecutionListener.notifyEach` (instance C1).

## Commands (run from this `cpp/` folder)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o observer main.cpp listeners.cpp runner.cpp
./observer ../test-data/events.txt
clang++ -std=c++20 -Wall -Wextra -pedantic -o observer_test test_main.cpp listeners.cpp runner.cpp
./observer_test
```

`observer_test` returns 0 when all checks pass and 1 otherwise (`echo $?` to see it).
`g++` works with the same flags.

To diff the program output against the expected file yourself:

```sh
./observer ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

## Files

| File | Role in the pattern |
|---|---|
| `listeners.hpp` / `.cpp` | Abstract listener, the composite with `notify_each`, three concrete listeners |
| `runner.hpp` / `.cpp` | Subject (`EventRunner`), `EventFormatError`, file reading and `report()` |
| `main.cpp` | Command line |
| `test_main.cpp` | Test runner (`main` returning 0 or 1) |

## How the pattern comes out in C++

- **Abstract base class with virtual functions.** The observer callbacks are `virtual` with empty
  bodies (like Java's `default` methods), so a listener overrides only what it needs, and `override`
  makes the compiler check the signatures.
- **`name()` is pure virtual.** C++ has no portable way to get a readable class name at run time
  (`typeid(...).name()` is compiler-specific and mangled), so each listener reports its own name.
  This is the one method every listener must write.
- **Who owns the memory.** There is no garbage collector, so ownership is written into the types:
  - The composite stores `std::shared_ptr<TestExecutionListener>`. `report()` keeps its own
    `shared_ptr` to the summary and log listeners so it can read them afterwards; each listener is
    freed when the last of those pointers goes away. The `BrokenListener` is owned only by the composite.
  - `EventRunner` only *borrows* its listener through a reference (`TestExecutionListener&`). That is
    safe because the composite lives on the stack in `report()` and outlives the runner.
  - In Java, Python and JavaScript none of this has to be said; the garbage collector keeps the
    objects alive as long as anything refers to them.
- **Failure isolation catches `const std::exception&`.** Something thrown that is not derived from
  `std::exception` (for example `throw 42;`) would still escape, much as JUnit lets unrecoverable
  errors through.
- **Each notification is a callable.** `notify_each` takes a `std::function<void(TestExecutionListener&)>`,
  the C++ counterpart of Java's `Consumer<TestExecutionListener>`.
