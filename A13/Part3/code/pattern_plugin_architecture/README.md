# Plugin Architecture: Misskey Frontend Plugin Architecture

**Why this instance:** The frontend has an explicit host (install, launch, abort), a handler registry and call sites that apply the registered handlers, so the extension points are easy to see.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- `installPlugin`: packages/frontend/src/plugin.ts:136
- Handler registry `pluginHandlers` and `addPluginHandler`: plugin.ts:227-236
- `launchPlugins`/`launchPlugin` (script exec, error is logged and rethrown): plugin.ts:238-311
- `abortPlugin` (drops the context and the plugin's handlers): plugin.ts:313-320
- Handler registrations such as `note_view_interruptor`: plugin.ts:381-427; lookup `getPluginHandlers`: plugin.ts:462-463

**How the source shows the pattern:** A plugin is a script that, while running, registers handlers for named extension points. The host only keeps the list and hands out handlers by type when asked, and aborting a plugin removes its handlers.

**Caveats:** The source's plugins are AiScript programs run in a sandbox; the extension-point registry is the part that is modelled. The host is one module (not a separate kernel process), so "microkernel" is used loosely.

**The small model:** `PluginHost.install(id, setup)` records the plugin and runs `setup`, which can add handlers through a callback; `abort(id)` removes the plugin's handlers; `get_handlers(type)` returns them in installation order. If `setup` throws, the error propagates and handlers registered before the error stay until `abort`, which is what the source does (nothing in `launchPlugin` removes them). The test defines four plugins: `upper`, `exclaim`, `share` and `bad`.

**Not modelled:** No sandbox, no plugin metadata or permissions, no persistence, no log, and only two handler types are exercised.

**Shared test cases:** `Part3/test-cases/plugin_architecture.txt` has 7 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
