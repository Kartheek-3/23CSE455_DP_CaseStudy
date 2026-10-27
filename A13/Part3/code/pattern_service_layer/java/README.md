# Service Layer: Java

- Production code: `AnnouncementService.java`
- Test runner: `AnnouncementServiceTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_service_layer/java/`:

```
javac -d build *.java
java -cp build AnnouncementServiceTest ../../../test-cases/service_layer.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Collaborators are constructor-injected interfaces (`EventPublisher`, `ModerationLog`); `Packed.read` is a boxed `Boolean` so null can mean "no user given".
