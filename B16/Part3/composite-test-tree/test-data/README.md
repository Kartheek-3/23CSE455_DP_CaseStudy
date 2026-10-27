# Composite test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `tree.txt` | Input: an engine, its test classes (one nested) and their test methods |
| `expected-output.txt` | Exact stdout for `tree.txt` with the tag `slow` (LF line endings, trailing newline) |
| `invalid-tree.txt` | Input where a test has a child on line 4 |
| `expected-error.txt` | The error message every version must raise for `invalid-tree.txt` |

## Tree format

```
engine <name>
  class <name>
    test <name> [@tag ...]
```

Two spaces per level. Classes can contain classes (like JUnit `@Nested`), only tests can carry tags,
and there is exactly one engine at the top. Blank lines and lines starting with `#` are ignored.

## What the program does

1. Builds the tree and prints it with a test count on every container.
2. Removes every test with the given tag (`slow` in the expected output), in document order.
3. Prunes every container left without tests, children before parents, as JUnit's
   `TestDescriptor.prune()` does. `SlowTests$Huge` goes first, then `SlowTests`, then `EmptyTests`,
   which was empty from the start. The engine itself is never pruned.
4. Prints the counts, what was removed and pruned, and the final tree.
