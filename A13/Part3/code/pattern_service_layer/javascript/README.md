# Service Layer: JavaScript

- Production code: `announcementService.js`
- Test runner: `announcementService.test.js` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_service_layer/javascript/`:

```
node announcementService.test.js ../../../test-cases/service_layer.txt
```

**Language notes:** Entities are object literals and missing values are `null`; collaborators are plain objects with the right methods.
