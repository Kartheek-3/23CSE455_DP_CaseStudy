# Front Controller: Java

- Production code: `ApiController.java`
- Test runner: `ApiControllerTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_front_controller/java/`:

```
javac -d build *.java
java -cp build ApiControllerTest ../../../test-cases/front_controller.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `Endpoint` is a record holding a `BiFunction`; the authenticator returns null for an unknown token.
