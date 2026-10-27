# Publish-Subscribe: Java

- Production code: `GlobalEventService.java`
- Test runner: `GlobalEventServiceTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_publish_subscribe/java/`:

```
javac -d build *.java
java -cp build GlobalEventServiceTest ../../../test-cases/publish_subscribe.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Handlers are `BiConsumer<String,String>` and unsubscribe works by object identity; JSON is built by string concatenation.
