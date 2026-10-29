# Observer: PreferencesManager Observer

**Why this instance:** The audit input has five Observer instances (global events, note capture, theme manager, deck columns, preferences). PreferencesManager was selected because one class is clearly the subject, its event type is declared, and the observer registration sits in a different file.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Subject `PreferencesManager extends EventEmitter<PreferencesManagerEvents>`: packages/frontend/src/preferences/manager.ts:194
- Event type map `PreferencesManagerEvents`: manager.ts:105-111
- `commit`: skips when the value is unchanged (manager.ts:254-257), updates the state through `rewriteRawState` (244-247, called at 261), then `emit('committed', {key, value, oldValue})` inside `_save` (265-272, emit at 267)
- Observer registration `prefer.on('committed', ...)`: packages/frontend/src/preferences.ts:116-126

**How the source shows the pattern:** A committed change is announced with one `emit('committed', ...)`. `preferences.ts` subscribes once and reacts by recording the update time and posting a message to the other tabs. The manager does not know who listens.

**Caveats:** Subject and observer roles are not declared classes. The subject machinery (`on`, `off`, `emit`) comes from the EventEmitter3 library, and the observer is a callback function. The other four Observer instances use the same mechanism and are not implemented separately. The snippets reproduce two details of the source that are easy to miss: an unchanged value is not announced, and the event's `oldValue` equals the new value, because `_save` reads `this.s[key]` after `rewriteRawState` has already stored the new value (`s` is a plain object, so no getter intervenes). Whether that is intended is not something the source says; it is reproduced as observed, and the fixture header notes it.

**The small model:** `PreferencesManager.commit(key, value)` does nothing when the key already holds that value. Otherwise it stores the value and notifies every registered listener with `(key, value, oldValue)`, where `oldValue` is read after the update and so equals `value`. Listeners are called in registration order, an unsubscribed listener is not called, unsubscribing an unknown listener does nothing, and an error thrown by a listener propagates to the committer and stops the remaining listeners (this is how a synchronous emit behaves).

**Not modelled:** Scopes, profiles, cloud sync, storage and deep comparison of non-string values are not modelled (values are strings, so plain equality stands in for `deepEqual`). The `oldValue` finding comes from reading the source; Misskey's frontend was not run.

**Shared test cases:** `Part3/test-cases/observer.txt` has 8 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
