# Factory: Logging Backend Factory

**Status:** Confirmed with caveat. The source has a private, simple factory function with one caller. There is no creator hierarchy, so it counts as Factory only in the "simple factory" sense, not as Factory Method or Abstract Factory.

**Why this instance:** It is the only Factory instance in the audit input that is not marked uncertain. It is small and has a clear error case.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- `createLoggingBackend(format)`: packages/backend/src/logging/logging-runtime.ts:21-25
- Product interface `LogBackend`: logging/LogBackend.ts:12-24
- Concrete products: PrettyConsoleBackend.ts:37, JsonConsoleBackend.ts:104
- Caller `configureLogging`, which validates first and then calls `logManager.setBackend`: logging-runtime.ts:28-32

**How the source shows the pattern:** The caller passes a configuration string and gets back a `LogBackend` without naming a concrete class. An absent value or `'pretty'` gives the pretty backend, `'json'` gives the JSON backend, and anything else throws before the current backend is replaced.

**Caveats:** This is a simple factory function (a conditional that returns one of two classes). It is not GoF Factory Method or Abstract Factory, there is no creator hierarchy, and the function is not exported. It also lives in the same file as the Strategy evidence, so the two instances share a code area.

**The small model:** `create_logging_backend(format)` returns a backend that reports its `name` and can format a line. Absent value and `pretty` give pretty, `json` gives JSON, everything else (including an empty string and `JSON`) raises `logging.format must be either pretty or json`.

**Not modelled:** The model has two products, like the source. It does not model the file-level default manager or configuration objects.

**Shared test cases:** `Part3/test-cases/factory.txt` has 6 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
