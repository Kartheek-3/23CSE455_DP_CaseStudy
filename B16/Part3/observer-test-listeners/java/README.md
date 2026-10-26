# Observer in Java

Based on JUnit's `TestExecutionListener` and `CompositeTestExecutionListener.notifyEach` (instance C1).

## Commands (run from this `java/` folder)

```sh
javac -d out src/observer/*.java test/observer/*.java
java -cp out observer.ObserverDemo ../test-data/events.txt
java -cp out observer.ObserverTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out observer.ObserverDemo ../test-data/events.txt | diff - ../test-data/expected-output.txt && echo same
```

`ObserverTest` exits with 0 when all checks pass and 1 otherwise (`echo $?` to see it).

## Files

| File | Role in the pattern |
|---|---|
| `src/observer/TestExecutionListener.java` | Observer interface, `default` no-op methods |
| `src/observer/CompositeTestExecutionListener.java` | Holds the observers; `notifyEach` isolates failures |
| `src/observer/SummaryListener.java`, `LoggingListener.java`, `BrokenListener.java` | Concrete observers |
| `src/observer/EventRunner.java` | Subject: parses the file and raises the events |
| `src/observer/Status.java`, `EventFormatException.java` | Status enum, input error |
| `src/observer/ObserverDemo.java` | Wiring and `main` |
| `test/observer/ObserverTest.java` | Test runner (plain `main`, exit code) |

## How the pattern comes out in Java

- **Static typing and a real interface.** The observer contract is a Java `interface`, and the
  compiler checks every listener against it. As in JUnit, every method is a `default` no-op, so
  `SummaryListener` overrides only the two events it cares about.
- **Notification is a lambda over the interface.** `notifyEach(String, Consumer<TestExecutionListener>)`
  mirrors JUnit's own `notifyEach`, where each callback is passed as a method call on the listener.
- **Failure isolation catches `RuntimeException`.** The interface declares no checked exceptions, so
  only unchecked ones can escape a listener. JUnit catches `Throwable` and rethrows unrecoverable
  errors such as `OutOfMemoryError`; this version simply does not catch `Error`.
- **The listener name comes from reflection.** `getClass().getSimpleName()` gives `BrokenListener`
  without the class having to say its own name.
- **Memory is garbage collected.** The composite and `ObserverDemo` both hold references to the
  same listener objects; nobody frees anything and nobody has to decide who owns them.
