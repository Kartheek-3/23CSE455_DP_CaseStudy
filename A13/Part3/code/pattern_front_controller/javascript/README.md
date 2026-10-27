# Front Controller: JavaScript

- Production code: `apiController.js`
- Test runner: `apiController.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_front_controller/javascript/`:

```
node apiController.test.js ../../../test-cases/front_controller.txt
```

**Language notes:** Endpoints are plain objects; `??` turns a missing user into the `anon` actor.
