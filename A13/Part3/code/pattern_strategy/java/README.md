# Strategy: Java

- Production code: `LogManager.java`
- Test runner: `LogManagerTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_strategy/java/`:

```
javac -d build *.java
java -cp build LogManagerTest ../../../test-cases/strategy.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** The strategy is a nominal interface (`LogBackend`); the compiler rejects a backend without `write`, and null is rejected by an explicit check in `setBackend`.
