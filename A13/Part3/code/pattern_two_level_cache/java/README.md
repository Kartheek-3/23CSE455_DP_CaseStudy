# Two-Level Cache: Java

- Production code: `RedisSingleCache.java`
- Test runner: `RedisSingleCacheTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_two_level_cache/java/`:

```
javac -d build *.java
java -cp build RedisSingleCacheTest ../../../test-cases/two_level_cache.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Absent is `null` (no `Optional`); the second level is a `RemoteStore` interface and the clock is a `LongSupplier`.
