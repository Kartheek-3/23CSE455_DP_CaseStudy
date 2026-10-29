# Composite in JavaScript (Node.js, ES modules)

Based on JUnit's `TestDescriptor` tree (instance A1): containers and leaves share one interface.

## Commands (run from this `javascript/` folder)

```sh
node src/main.js ../test-data/tree.txt slow
node --test test/composite.test.js
```

`npm start` and `npm test` run the same two commands. There are no dependencies, so there is
nothing to install.

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/tree.txt slow | diff - ../test-data/expected-output.txt && echo same
```

## Files

| File | Role in the pattern |
|---|---|
| `src/nodes.js` | `TestNode` base class (component), `TestCase` (leaf), `TestContainer` (composite) |
| `src/tree-parser.js` | Builds the tree from the indented file; `TreeFormatError` |
| `src/app.js` | Client: count, remove by tag, prune, print |
| `src/main.js` | Command line |
| `test/composite.test.js` | `node:test` tests |
| `package.json` | Marks the folder as ES modules (`"type": "module"`) |

## How the pattern comes out in JavaScript

- **No interfaces or abstract classes, so the base class fakes them.** `TestNode`'s constructor
  refuses `new TestNode(...)` (via `new.target`), and each method throws if a subclass did not
  override it. A missing method is only found when it is called.
- **Duck typing underneath.** `TestContainer` calls `child.countTests()` on whatever it holds; any
  object with the right methods would work. `extends TestNode` is documentation and a safety net.
- **Private children.** `#children` is a private field, so nothing outside `TestContainer` can edit
  the list; removal reassigns it with `Array.prototype.filter`.
- **"Safe" Composite.** `addChild` exists only on `TestContainer`; the parser checks
  `parent instanceof TestContainer`. JUnit's `TestDescriptor` puts `addChild` on the component itself.
- **Memory is garbage collected.** A removed child is dropped from the array and collected later.
