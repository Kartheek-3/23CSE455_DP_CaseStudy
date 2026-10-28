# Composite in Java

Based on JUnit's `TestDescriptor` tree (instance A1): `EngineDescriptor` and class descriptors are
containers, `TestMethodTestDescriptor` is a leaf, and both share one interface.

## Commands (run from this `java/` folder)

```sh
javac -d out src/composite/*.java test/composite/*.java
java -cp out composite.CompositeDemo ../test-data/tree.txt slow
java -cp out composite.CompositeTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out composite.CompositeDemo ../test-data/tree.txt slow | diff - ../test-data/expected-output.txt && echo same
```

`CompositeTest` exits with 0 when all checks pass and 1 otherwise (`echo $?` to see it).

## Files

| File | Role in the pattern |
|---|---|
| `src/composite/TestNode.java` | Component interface |
| `src/composite/TestCase.java` | Leaf (a `record`) |
| `src/composite/TestContainer.java` | Composite (engine or class), owns the child list |
| `src/composite/TreeParser.java`, `TreeFormatException.java` | Builds the tree from the indented file |
| `src/composite/CompositeDemo.java` | Client: count, remove by tag, prune, print; `main` |
| `test/composite/CompositeTest.java` | Test runner (plain `main`, exit code) |

## How the pattern comes out in Java

- **The component is an `interface`.** `countTests`, `removeTestsTagged`, `pruneEmpty` and `print`
  are declared once in `TestNode`; the client calls them on the root and never asks what kind of
  node it has.
- **"Safe" rather than "transparent" Composite.** `addChild` exists only on `TestContainer`, so the
  compiler stops anyone adding a child to a test. JUnit chose the transparent form: `addChild` is on
  `TestDescriptor` itself. The parser is the only place that needs `instanceof TestContainer`, and it
  uses Java's pattern-matching `instanceof`.
- **The leaf is a `record`.** A test's name and tags never change, so a record gives the immutable
  value class in one line.
- **Leaves answer the uniform questions too.** A test counts as 1 and has tags; a container has no
  tags and counts its children. That is why the parent can remove a tagged test with `child.hasTag`,
  and prune an empty container with `child.countTests() == 0`, without checking types.
- **Memory is garbage collected.** A removed child is just dropped from the list and collected later.
