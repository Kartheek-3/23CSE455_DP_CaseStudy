# Template Method: Misskey Chart Processing Framework

**Why this instance:** `Chart.tick` is a textbook skeleton method with two abstract steps, and 16 chart classes fill in those steps.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Abstract class `Chart`: packages/backend/src/core/chart/core.ts:177
- Abstract steps `tickMajor` / `tickMinor`: core.ts:196, 201
- Template method `tick`: core.ts:583-584 onward (column naming, clamping, skipping empty results, persisting)
- Concrete charts with non-trivial hooks: core/chart/charts/instance.ts:51 (`tickMajor`), 75 (`tickMinor`); 16 files under core/chart/charts extend `Chart<` (`active-users.ts:41,45` has hooks that just return `{}`)
- Callers of the template method: queue/processors/TickChartsProcessorService.ts:52-54 (`chart.tick(false)`) and `resync` at core.ts:619-621

**How the source shows the pattern:** `tick` decides which hook to call, then performs the common work (prefix and rename columns, clamp to the column range, skip when empty, update hour and day records). The subclasses only say what numbers to compute.

**Caveats:** Persistence in the source goes through database repositories and is asynchronous. In the model, "persisting" is appending to an in-memory list.

**The small model:** `Chart.tick(major)` calls `tick_major` or `tick_minor`, prefixes each key with `___` and replaces `.` with `_` (as `COLUMN_PREFIX` and `COLUMN_DELIMITER` do in the source), clamps values to 0..1000, and stores the result only when it is not empty. `UsersChart` and `NotesChart` are the concrete classes; a failing chart is defined in the test.

**Not modelled:** The source clamps with each column's declared range (`small` or `big`), not a fixed 0..1000. The grouping and the hour/day records are not modelled.

**Shared test cases:** `Part3/test-cases/template_method.txt` has 5 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
