# Strategy: Logging Output Strategy

**Why this instance:** LogManager is the cleanest Strategy in the audit input: one context, one interface, three interchangeable implementations and a setter that swaps them while the program runs.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Strategy interface `LogBackend`: packages/backend/src/logging/LogBackend.ts:12-24
- Concrete strategies: BootstrapConsoleBackend.ts:22, JsonConsoleBackend.ts:104, PrettyConsoleBackend.ts:37 (same directory)
- Context `LogManager`: LogManager.ts:220; `setBackend` 255-256; delegation `backend.write` 367, `writeAccess` 412, `flush`/`close` 294-296
- Default strategy installed at start-up: logging-runtime.ts:18

**How the source shows the pattern:** `LogManager` never formats or prints anything itself. Every record goes to `this.backend.write(record)`, and `setBackend` replaces the object, so the output format changes for all later records without touching the manager.

**Caveats:** None beyond the usual simplification. In the source the Factory pattern (`createLoggingBackend`) picks the backend that gets passed to `setBackend`; the Factory snippet models that part separately.

**The small model:** A `LogManager` holds a backend with one method, `write(level, message)`, which returns the formatted line. Three backends: bootstrap (`info: text`), pretty (`[INFO] text`) and JSON (`{"level":"info","message":"text"}`). The real code writes a record object to the console and has `flush`, `close` and `writeAccess`; those are left out. Rejecting a null backend is a rule of the model; the source's `setBackend` itself has no such check.

**Not modelled:** The JSON backend in the Java, Python and C++ versions builds the string by concatenation, so a message containing a double quote would be escaped differently from the JavaScript version (`JSON.stringify`). The fixture avoids quotes.

**Shared test cases:** `Part3/test-cases/strategy.txt` has 5 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
