# Composite in C++20

Based on JUnit's `TestDescriptor` tree (instance A1): containers and leaves share one interface.

## Commands (run from this `cpp/` folder)

```sh
clang++ -std=c++20 -Wall -Wextra -pedantic -o composite main.cpp nodes.cpp tree_parser.cpp
./composite ../test-data/tree.txt slow
clang++ -std=c++20 -Wall -Wextra -pedantic -o composite_test test_main.cpp nodes.cpp tree_parser.cpp
./composite_test
```

`composite_test` returns 0 when all checks pass and 1 otherwise (`echo $?` to see it).
`g++` works with the same flags.

To diff the program output against the expected file yourself:

```sh
./composite ../test-data/tree.txt slow | diff - ../test-data/expected-output.txt && echo same
```

## Files

| File | Role in the pattern |
|---|---|
| `nodes.hpp` / `.cpp` | `TestNode` abstract base (component), `TestCase` (leaf), `TestContainer` (composite) |
| `tree_parser.hpp` / `.cpp` | Builds the tree; `TreeFormatError`, file reading and `report()` |
| `main.cpp` | Command line |
| `test_main.cpp` | Test runner (`main` returning 0 or 1) |

## How the pattern comes out in C++

- **Abstract base class with pure virtual functions.** `TestNode` declares every operation `= 0`,
  so the compiler refuses to build a node class that forgets one. Copying is deleted, because a
  node is used through pointers to its base class and copying it would slice it.
- **Who owns the memory.** The tree is an ownership tree:
  - Each `TestContainer` owns its children as `std::vector<std::unique_ptr<TestNode>>`. When
    `report()` returns, the root `unique_ptr` goes out of scope and the whole tree is freed in one
    go, children before parents, with no `delete` written anywhere.
  - Removing a test or pruning a container with `std::erase_if` destroys that `unique_ptr`, so the
    node is freed at that moment, not "some time later" as with a garbage collector.
  - The parser keeps a stack of raw `TestNode*` to remember the current path. Those pointers do not
    own anything; they point into the tree, which outlives them.
  - `add_child` takes a `unique_ptr` by value, so the caller has to `std::move` the node in; the type
    makes the hand-over of ownership visible. In Java, Python and JavaScript there is no such
    hand-over, since every reference keeps the object alive.
- **"Safe" Composite.** `add_child` exists only on `TestContainer`; the parser uses
  `dynamic_cast<TestContainer*>` to reject a test with children. JUnit's `TestDescriptor` puts
  `addChild` on the component itself.
- **Uniform operations replace type checks.** Removal asks `child->has_tag(tag)` and pruning asks
  `child->count_tests() == 0`, so neither needs to know whether the child is a leaf or a container.
