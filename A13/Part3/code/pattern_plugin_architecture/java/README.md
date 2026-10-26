# Plugin Architecture: Java

- Production code: `PluginHost.java`
- Test runner: `PluginHostTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_plugin_architecture/java/`:

```
javac -d build *.java
java -cp build PluginHostTest ../../../test-cases/plugin_architecture.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `setup` is a `Consumer<HandlerRegistrar>` and handlers are `Function<String,String>`; a private record holds the registry entries.
