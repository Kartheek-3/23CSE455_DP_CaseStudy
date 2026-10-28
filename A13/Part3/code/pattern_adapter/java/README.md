# Adapter: Java

- Production code: `TelemetryRegistry.java`
- Test runner: `TelemetryRegistryTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_adapter/java/`:

```
javac -d build *.java
java -cp build TelemetryRegistryTest ../../../test-cases/adapter.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** Both the Target and the Adaptee need declared interfaces (`TelemetryAdapter`, `SentryClient`) because the type system must know the SDK's shape; `<T> T startSpan` keeps the span's return type.
