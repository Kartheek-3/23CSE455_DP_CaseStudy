# Observer in JavaScript (Node.js, ES modules)

Based on JUnit's `TestExecutionListener` and `CompositeTestExecutionListener.notifyEach` (instance C1).

## Commands (run from this `javascript/` folder)

```sh
node src/main.js ../test-data/events.txt
node --test test/observer.test.js
```

`npm start` and `npm test` run the same two commands. There are no dependencies, so there is
nothing to install.

To diff the program output against the expected file yourself:

```sh
node src/main.js ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

## Files

| File | Role in the pattern |
|---|---|
| `src/listeners.js` | Base listener class, the composite with `#notifyEach`, three concrete listeners |
| `src/runner.js` | Subject: parses the file and raises the events; `EventFormatError` |
| `src/app.js` | Wiring and `report()` |
| `src/main.js` | Command line |
| `test/observer.test.js` | `node:test` tests |
| `package.json` | Marks the folder as ES modules (`"type": "module"`) |

## How the pattern comes out in JavaScript

- **Classes, but no interfaces.** `TestExecutionListener` is a class whose methods do nothing, so
  subclasses override only what they need, like JUnit's `default` methods. Nothing enforces the
  contract: the test registers a plain object `{ executionStarted }` and the composite accepts it.
  If that object were sent an event it lacks, the resulting `TypeError` would be caught and recorded
  like any other listener failure.
- **Private state uses `#fields`.** The composite's listener list and `#notifyEach` are truly private,
  which is the closest JavaScript gets to Java's `private`.
- **Anything can be thrown.** `catch (error)` catches every thrown value, not only `Error` objects;
  the listeners here always throw `Error`, so `error.message` is safe.
- **The listener name comes from `listener.constructor.name`.**
- **Memory is garbage collected,** so sharing the same listener objects between the composite and
  `report()` needs no ownership rules.
- **Callbacks are synchronous here.** In Node an observer is often an `EventEmitter` listener or an
  async callback; this version stays synchronous so the output order matches the other languages.
