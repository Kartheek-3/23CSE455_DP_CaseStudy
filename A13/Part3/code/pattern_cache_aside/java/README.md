# Cache-Aside: Java

- Production code: `FederatedInstanceService.java`
- Test runner: `FederatedInstanceServiceTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_cache_aside/java/`:

```
javac -d build *.java
java -cp build FederatedInstanceServiceTest ../../../test-cases/cache_aside.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** A `HashMap` may hold null, so a cached "not found" can only be told apart from a miss with `containsKey` (the `has` method); `Instance` is a record.
