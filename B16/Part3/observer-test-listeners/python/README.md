# Observer in Python

Based on JUnit's `TestExecutionListener` and `CompositeTestExecutionListener.notifyEach` (instance C1).

## Commands (run from this `python/` folder)

```sh
python3 main.py ../test-data/events.txt
python3 -m unittest -v test_observer
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

## Files

| File | Role in the pattern |
|---|---|
| `listeners.py` | Base listener with no-op methods, the composite with `_notify_each`, three concrete listeners |
| `runner.py` | Subject: parses the file and raises the events; `EventFormatError` |
| `main.py` | Wiring, `report()` and the command line |
| `test_observer.py` | `unittest` tests |

## How the pattern comes out in Python

- **Duck typing instead of an interface.** `TestExecutionListener` is a plain base class that only
  supplies no-op methods, like JUnit's `default` methods. The composite never checks types: it just
  calls `execution_started(...)` and so on. The test registers a `Recorder` class that does not
  inherit from anything, and it works, because it has the method being called.
- **No ABC here on purpose.** An `abc.ABC` with `@abstractmethod` would force every listener to
  implement all three callbacks, which is the opposite of what the Observer interface in JUnit wants.
  (The Composite program does use an ABC, where every method really is required.)
- **Errors are found at run time.** A misspelt method name in a listener is not an error until that
  event fires; in Java the compiler would catch it with `@Override`.
- **Failure isolation catches `Exception`.** That deliberately lets `KeyboardInterrupt` and
  `SystemExit` (which derive from `BaseException`) through, much as JUnit rethrows unrecoverable errors.
- **The listener name comes from `type(listener).__name__`.**
- **Memory is garbage collected** (reference counting plus a cycle collector), so the composite and
  `report()` can both hold the same listener objects without any ownership rules.
