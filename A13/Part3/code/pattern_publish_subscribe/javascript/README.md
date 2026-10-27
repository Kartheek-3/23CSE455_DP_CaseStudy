# Publish-Subscribe: JavaScript

- Production code: `eventBus.js`
- Test runner: `eventBus.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_publish_subscribe/javascript/`:

```
node eventBus.test.js ../../../test-cases/publish_subscribe.txt
```

**Language notes:** Handlers are functions in a `Map` of arrays; `JSON.stringify` builds the message.
