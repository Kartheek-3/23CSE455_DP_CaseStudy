# Observer: Java

- Production code: `PreferencesManager.java`
- Test runner: `PreferencesManagerTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_observer/java/`:

```
javac -d build *.java
java -cp build PreferencesManagerTest ../../../test-cases/observer.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** An own listener list of `Consumer<CommitEvent>`; `off` removes by object identity and notification iterates over a copy, so a listener can unsubscribe while being notified. There is only one event type, so there are no event names.
