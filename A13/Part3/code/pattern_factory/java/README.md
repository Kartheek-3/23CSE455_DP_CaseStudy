# Factory: Java

- Production code: `LoggingFactory.java`
- Test runner: `LoggingFactoryTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_factory/java/`:

```
javac -d build *.java
java -cp build LoggingFactoryTest ../../../test-cases/factory.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Java has no free functions, so the factory is a static method on `LoggingFactory`; it returns the `LogBackend` interface type.
