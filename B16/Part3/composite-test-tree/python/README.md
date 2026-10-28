# Composite in Python

Based on JUnit's `TestDescriptor` tree (instance A1): containers and leaves share one interface.

## Commands (run from this `python/` folder)

```sh
python3 main.py ../test-data/tree.txt slow
python3 -m unittest -v test_composite
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/tree.txt slow | diff - ../test-data/expected-output.txt && echo same
```

## Files

| File | Role in the pattern |
|---|---|
| `nodes.py` | `TestNode` ABC (component), `TestCase` (leaf), `TestContainer` (composite) |
| `tree_parser.py` | Builds the tree from the indented file; `TreeFormatError` |
| `main.py` | Client: count, remove by tag, prune, print; command line |
| `test_composite.py` | `unittest` tests |

## How the pattern comes out in Python

- **An ABC for the component.** Here every node really must implement every operation, so
  `TestNode` is an `abc.ABC` with `@abstractmethod`s. Python then refuses to create a subclass
  instance that is missing one, which is the closest it gets to Java's compile-time check, but the
  check still happens at run time, when the object is created.
- **Dynamic typing makes the recursion short.** `sum(child.count_tests() for child in self.children)`
  works for any child that has the method; the ABC documents the contract more than it enforces it.
- **"Safe" Composite.** `add_child` exists only on `TestContainer`; the parser uses
  `isinstance(parent, TestContainer)` to reject a test with children. JUnit's `TestDescriptor` puts
  `addChild` on the component itself (the "transparent" form).
- **Lists are rebuilt rather than edited in place,** because removing from a list while iterating
  over it skips elements in Python.
- **Memory is garbage collected.** A removed child loses its last reference and is freed by
  reference counting straight away.
