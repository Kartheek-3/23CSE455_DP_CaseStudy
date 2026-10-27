# Template Method: Java

- Production code: `Chart.java`
- Test runner: `ChartTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_template_method/java/`:

```
javac -d build *.java
java -cp build ChartTest ../../../test-cases/template_method.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `tick` is `final` and the hooks are `protected abstract`, so subclasses cannot replace the skeleton and the compiler rejects a subclass missing a hook.
