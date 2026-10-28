# Router: Java

- Production code: `Router.java`
- Test runner: `RouterTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_router/java/`:

```
javac -d build *.java
java -cp build RouterTest ../../../test-cases/router.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `Route` and `Resolved` are records, and an unmatched path is a `Resolved` with a null route (the catch-all).
