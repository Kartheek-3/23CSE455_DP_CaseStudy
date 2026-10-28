# Plugin Architecture: JavaScript

- Production code: `pluginHost.js`
- Test runner: `pluginHost.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_plugin_architecture/javascript/`:

```
node pluginHost.test.js ../../../test-cases/plugin_architecture.txt
```

**Language notes:** Same closure-based registration; handlers are arrow functions and the registry holds plain objects.
