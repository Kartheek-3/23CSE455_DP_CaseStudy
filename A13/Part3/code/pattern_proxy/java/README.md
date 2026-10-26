# Proxy: Java

- Production code: `AnalyticsProxy.java`
- Test runner: `AnalyticsProxyTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_proxy/java/`:

```
javac -d build *.java
java -cp build AnalyticsProxyTest ../../../test-cases/proxy.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** The proxy implements the same interface and checks for null on each call; the real subject is created by the caller and set once.
