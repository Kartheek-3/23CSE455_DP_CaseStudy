# Adapter: Telemetry Backend Adapter Layer

**Status:** Confirmed with caveat. The translation to the Sentry SDK is real, but there is only one adapter and the target interface was shaped around Sentry's features, so the benefit of the layer is partly prospective.

**Why this instance:** It shows Adapter in its most literal form: the application owns an interface and one class translates it to a third-party SDK with a different call shape.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Target `TelemetryAdapter` and option type: packages/backend/src/core/telemetry/adapters/TelemetryAdapter.ts:11-48
- Adapter `SentryTelemetryAdapter`: adapters/SentryTelemetryAdapter.ts:71-112 (`captureMessage` 86-92, `startSpan` 103-105, `shutdown` 107-110; timeout constant at line 12)
- Client (registry holding `TelemetryAdapter[]`): packages/backend/src/core/telemetry/telemetry-registry.ts:16-52
- Adaptee: the `@sentry/node` module, not part of the repository source

**How the source shows the pattern:** The registry only calls `captureMessage`, `startSpan` and `shutdown` on `TelemetryAdapter`. `SentryTelemetryAdapter` turns `(message, {level, userId})` into `Sentry.captureMessage(message, {level, user: {id}, extra})`, wraps `startSpan(name, fn)` as `Sentry.startSpan({name}, fn)`, and calls `Sentry.close(5000)` on shutdown.

**Caveats:** Only one adapter exists in the repository, so the adapter layer's value is mostly prospective. In the model, two instances of the same adapter class are used to exercise the registry's fan-out and span nesting; that is not a second backend.

**The small model:** `SentryTelemetryAdapter` translates to a fake Sentry client that records the calls it receives. The registry fans messages out to all adapters, nests spans (outermost adapter first) and runs the function directly when there are no adapters. An error thrown inside a span passes through unchanged. The fake client is part of the test, not the production file.

**Not modelled:** `extra`, `getActiveTraceContext` and the Promise/async parts of the source are left out.

**Shared test cases:** `Part3/test-cases/adapter.txt` has 8 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
