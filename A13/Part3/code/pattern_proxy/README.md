# Proxy: AnalyticsProxy

**Why this instance:** `AnalyticsProxy` is a small class in a single file and implements the same interface as the object it stands in for.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Proxy `AnalyticsProxy implements AnalyticsInstance`: packages/frontend/src/analytics.ts:12-78
- Late binding of the real subject `setAnalytics`: analytics.ts:21-26
- Shared proxy instance: analytics.ts:80; real instance installed by `initAnalytics` (after dynamic `import('analytics')`)

**How the source shows the pattern:** Application code calls `analytics.track(...)` and similar methods from the start. Until `initAnalytics` has loaded the library and called `setAnalytics`, each method returns a no-op; afterwards the same call is forwarded to the real instance. The class comment says it exists so the code works without loading the analytics module.

**Caveats:** It overlaps with Null Object because it returns no-ops when the real object is missing. It is classified as a Proxy because it stands in for one specific subject, shares its interface and forwards to it, with the lazily loaded library as the real subject.

**The small model:** `AnalyticsProxy` and `RealAnalytics` share an interface with `track`, `page` and `identify`. Before `set` the proxy returns `noop`; afterwards it returns what the real object returns (`real:track login`). A second `set` raises `Analytics instance already exists.` The source has more methods (`ready`, `on`, `storage`, ...), which are not modelled.

**Not modelled:** The real library is replaced by a small class; lazy loading itself is not modelled, only the late binding.

**Shared test cases:** `Part3/test-cases/proxy.txt` has 5 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
