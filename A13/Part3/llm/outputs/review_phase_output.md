Assistant text output for prompts 7 and 8 (review preparation, then the corrections).
Only the assistant's text messages are included . Every text message between prompt 7 and prompt 9 is here.
The output for prompt 9 (finishing the LLM records) is not in this file.
The generator scripts changed during prompt 8 follow after the messages (the earlier versions are in implementation_phase_output.md).

===== assistant message (2026-10-10T12:42:24.144Z) =====
The review packet is ready, and the three `evaluation` cells in `data/llm.csv` are blank, so no final evaluation is recorded. The checklist is `Part3/llm/verification/human_review_checklist.md`. It has a blank reviewer record at the bottom, since I have not recorded you as reviewer.

## What I checked directly

- **State:** Misskey HEAD is still `53ac6808…` with a clean tree. `audit-input/` and `audit-results/` were not touched.
- **Prompts:** all six prompts in `part3_prompt.txt` appear verbatim in the session transcript.
- **Model:** every assistant message in the transcript carries `claude-sonnet-5-5`.
- **Source:** I re-read the cited Misskey files with line numbers for all 15 patterns, not the READMEs.
- **Tests:** I re-ran all 60 snippets without timing, and all passed.
- **Fixtures:** each test reads its fixture path from the command line, and all four languages use the same fixture file per pattern.
- **Medians:** recomputed from the raw timings; all 60 match the CSV, with 5 runs each and exit code 0.
- **Versions:** the runtime and compiler versions still match the CSV.
- **LOC:** an independent line count agrees with lizard, except for explained differences.
  - Python: lizard excludes docstrings.
  - C++: lizard leaves out one `#pragma once` line per file.
- **Complexity:** radon agrees with lizard on 14 of 15 Python files (Router is 11 in radon, 10 in lizard).

## What relies only on logs or records

- Complexity for Java, JavaScript and C++ comes from lizard alone.
- The warm-up run is in the script, but its time is not stored, so the logs cannot prove it ran.
- The original first-version generated code exists only in the session transcript, not in the submission folder.

## Missing evidence

- **Access tier:** it is not in the transcript or anywhere visible to me. You need to supply it.
- **Layer-wide Service Layer evidence:** I re-read `AnnouncementService` and its endpoint call. I did not re-read `CoreModule.ts`, and I read no other service.

## Provisional assessments (mine, not final)

**Correct (11):** Strategy, Adapter, Template Method, Proxy, Observer, Two-Level Cache, Cache-Aside, Publish-Subscribe, Job Queue, Router, Plugin Architecture.

**Partial (4):**
- **Factory:** it is one private function with one caller, a simple factory only.
- **Front Controller:** routing is one Fastify route per endpoint. The shared pre-processing in `ApiCallService` is what fits the pattern.
- **Service Layer:** I verified one service, not the whole layer.
- **Repository:** the abstraction comes from TypeORM, and Misskey only adds DI wiring and `insertOne`.

No pattern looks incorrect.

## Things this review found

1. **Observer `oldValue`:** in the source, `commit` reads `oldValue` after `rewriteRawState` has stored the new value, so the emitted `oldValue` appears to carry the new value. It also skips the emit when the value is unchanged. My snippets report the previous value and always emit.
2. **Cache-Aside:** the cache is a `RedisKVCache` built with a fetcher, so it can read through. The service only uses `get` and `set`, which is why the methods count as Cache-Aside.
3. **Front Controller rate limit:** it applies only when the endpoint declares a limit, and it is keyed per endpoint. My model uses one global limit of 2 calls per actor.
4. **Verification note error:** my earlier note said lizard counts docstrings as code. It does not, and I corrected the note.

I updated the Observer, Cache-Aside, Publish-Subscribe, Front Controller and Template Method READMEs with these findings. I did not change any code or fixtures, and `cross_language.csv` was not regenerated because none of the edits touch measured files.

## Decisions for you

1. Keep the four partial patterns with their caveats, or replace one? Replacing one would change the approved 15-pattern scope, so I did not do it.
2. Accept Cache-Aside and Two-Level Cache as separate instances over one cache class, or note the overlap in the report?
3. Observer `oldValue`: keep the snippets as they are and say so in the report, or change the snippets and fixture to match the source?
4. Confirm your rubric accepts the non-GoF patterns (Router, Service Layer, Plugin Architecture).
5. Provide the access tier.
6. One instance per type (15), or all 19 confirmed instances?
7. Include the session transcript with the submission or not. It holds the whole conversation and local paths, so I did not copy it.
8. Set the final `evaluation` (`correct`, `partial`, `incorrect` or `cannot confirm`) for each of the three `data/llm.csv` rows.

===== assistant message (2026-10-10T13:14:06.075Z) =====
The Observer examples now follow the source, and the rest of the evidence is regenerated and consistent. The four rows in `data/llm.csv` have blank evaluation cells, and no human review is claimed.

## Observer `oldValue`
- **Source** (`frontend/src/preferences/manager.ts`): `commit` returns early when the value is unchanged (254-257). It then calls `rewriteRawState` (261), which sets `this.s[key] = v` (244-247). `_save` emits `oldValue: this.s[key]` afterwards (267-271). `s` is a plain object (203), so no getter intervenes. The emitted `oldValue` therefore equals the new value.
- **Limit of the finding:** this comes from reading the code. I did not run Misskey's frontend.
- **Changed:**
  - The four Observer snippets: unchanged commits emit nothing, and `oldValue` is read after the state update.
  - `test-cases/observer.txt`: new expected strings and one new case (`unchanged_value_not_announced`), 8 cases in all.
  - The Observer README.
- **Tests:** 8/8 pass in Java, Python, JavaScript and C++.

## Evidence after the change
- I reran the whole measurement harness, so every log, raw timing, lizard row and `cross_language.csv` row comes from one run. Observer is now 22 / 3 / 93.3 ms (Java), 18 / 4 / 27.3 (Python), 13 / 3 / 46.1 (JavaScript) and 35 / 4 / 3.4 (C++), as LOC / max CC / median ms.
- All 60 snippets pass. The fixtures have 97 cases, so 388 test executions.
- I rechecked that `cross_language.csv`, the test logs, `raw_timing.csv` and the fixture case counts agree. The medians recompute exactly, and there are no compiler warnings.
- `Part3/README.md` results table and counts were regenerated.

## Documentation corrections
- **Status lines:** the six caveated pattern READMEs (Factory, Adapter, Cache-Aside, Front Controller, Service Layer, Repository) now start with a **Status** line saying "confirmed with caveat" and what the limitation is. The Service Layer README says only `AnnouncementService` was read in detail.
- **Cache-Aside vs Two-Level Cache:** both READMEs and `Part3/README.md` now explain the difference. Two-Level Cache is cache infrastructure (memory in front of Redis, fetcher on a miss). Cache-Aside is application code that reads the cache, queries the database and writes back.
- **Lizard/docstring note:** corrected in `implementation_verification.md`. Lizard excludes docstrings from NLOC, so my earlier reason for changing the Python Adapter docstring was wrong, although the change itself was harmless.
- **Scope decisions:** the Router, Service Layer and Plugin Architecture rationale is recorded in `human_review_checklist.md` section 5. The report template lists "GoF / GRASP / architecture / concurrency / framework idiom" as categories. Whether a grader accepts each one is still the instructor's call.

## LLM records
- **Prompts:** `part3_prompt.txt` now holds all 8 prompts. Prompts 1-6 were checked as unchanged, and 7-8 were extracted from the transcript.
- **Review phase:** `outputs/review_phase_output.md` holds the assistant text for prompts 7-8 and the generator scripts changed then. `data/llm.csv` has a fourth row for that phase.
- **Transcript:** the session transcript stays at a private location and is not copied. `Part3/llm/README.md` says so.
- **Access tier:** still "not recorded".
- **Proposed evaluations:** section 7 of `human_review_checklist.md` has the table of records, claims, evidence checked and my provisional evaluation. The cells in `data/llm.csv` stay blank until you decide.

| record | provisional | main reason |
|---|---|---|
| 1. selection and source verification | partial | counts, commit and locations hold, but early line ranges were approximate, one sentence was too strong, and the uncertain rows were taken from the audit unread |
| 2. the 60 snippets and READMEs | partial | tests and equivalence hold, but Observer contradicted its cited source and one README claim and one note were wrong; now corrected |
| 3. measurement harness | correct | medians, versions and independent LOC checks agree; the warm-up time is not stored, though the script runs it |
| 4. review and corrections | correct (not executed) | each point is tied to lines I read; say `cannot confirm` if you want execution evidence for the Observer finding |

## Left for you
- Review the table and set the four `evaluation` cells with `correct`, `partial`, `incorrect` or `cannot confirm`.
- Provide the access tier for `model_and_date`.
- Decide whether the extracted outputs are acceptable as the exact outputs, since the full transcript is not in the folder.
- Fill in the reviewer record at the end of `human_review_checklist.md` when you have reviewed.

`audit-input/`, `audit-results/` and the Misskey tree are unchanged.

===== generator script (current version): p_observer.py =====
from gen import *
prod = {}
prod["python"] = '''
from collections import namedtuple

Committed = namedtuple("Committed", "key value old_value")


class PreferencesManager:
    def __init__(self):
        self._state = {}
        self._listeners = []

    def on(self, listener):
        self._listeners.append(listener)

    def off(self, listener):
        if listener in self._listeners:
            self._listeners.remove(listener)

    def commit(self, key, value):
        if key in self._state and self._state[key] == value:
            return  # an unchanged value is not announced (manager.ts:254-257)
        self._state[key] = value
        # As in manager.ts:261-271, old_value is read after the state was updated, so it equals value.
        event = Committed(key, value, self._state[key])
        for listener in list(self._listeners):
            listener(event)
'''
prod["javascript"] = '''
const { EventEmitter } = require('events');

// The subject is a plain Node EventEmitter; observers subscribe with on('committed', fn).
class PreferencesManager extends EventEmitter {
  constructor() {
    super();
    this.state = new Map();
  }

  commit(key, value) {
    if (this.state.has(key) && this.state.get(key) === value) return; // unchanged: not announced
    this.state.set(key, value);
    // As in manager.ts:261-271, oldValue is read after the state was updated, so it equals value.
    this.emit('committed', { key, value, oldValue: this.state.get(key) });
  }
}

module.exports = { PreferencesManager };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

record CommitEvent(String key, String value, String oldValue) {}

public class PreferencesManager {
    private final Map<String, String> state = new HashMap<>();
    private final List<Consumer<CommitEvent>> listeners = new ArrayList<>();

    public void on(Consumer<CommitEvent> listener) {
        listeners.add(listener);
    }

    public void off(Consumer<CommitEvent> listener) {
        listeners.remove(listener);
    }

    public void commit(String key, String value) {
        if (value.equals(state.get(key))) return; // unchanged: not announced
        state.put(key, value);
        // As in manager.ts:261-271, oldValue is read after the state was updated, so it equals value.
        CommitEvent event = new CommitEvent(key, value, state.get(key));
        for (Consumer<CommitEvent> listener : new ArrayList<>(listeners)) listener.accept(event);
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <functional>
#include <map>
#include <string>
#include <utility>
#include <vector>

struct CommitEvent {
    std::string key;
    std::string value;
    std::string oldValue;
};

class PreferencesManager {
public:
    using Listener = std::function<void(const CommitEvent&)>;

    // std::function cannot be compared, so on() hands back a handle for off().
    int on(Listener listener) {
        listeners_.emplace_back(++lastHandle_, std::move(listener));
        return lastHandle_;
    }

    void off(int handle) {
        listeners_.erase(std::remove_if(listeners_.begin(), listeners_.end(),
                                        [handle](const auto& l) { return l.first == handle; }),
                         listeners_.end());
    }

    void commit(const std::string& key, const std::string& value) {
        if (auto it = state_.find(key); it != state_.end() && it->second == value) return;  // unchanged: not announced
        state_[key] = value;
        // As in manager.ts:261-271, oldValue is read after the state was updated, so it equals value.
        CommitEvent event{key, value, state_[key]};
        auto snapshot = listeners_;
        for (const auto& [handle, listener] : snapshot) listener(event);
    }

private:
    int lastHandle_ = 0;
    std::map<std::string, std::string> state_;
    std::vector<std::pair<int, Listener>> listeners_;
};
'''
tests = {}
tests["python"] = ("from preferences_manager import PreferencesManager", '''
def run(text):
    manager = PreferencesManager()
    out, listeners = [], {}

    def make(name):
        def listener(event):
            if name == "boom":
                raise RuntimeError("listener failed")
            out.append("%s:%s=%s(oldValue=%s)" % (name, event.key, event.value, event.old_value))
        return listener

    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "on":
                listeners[parts[1]] = make(parts[1])
                manager.on(listeners[parts[1]])
            elif parts[0] == "off":
                manager.off(listeners.get(parts[1]))
            elif parts[0] == "commit":
                manager.commit(parts[1], parts[2])
        except RuntimeError as e:
            out.append("ERR:" + str(e))
    return "~".join(out)
''')
tests["javascript"] = ("const { PreferencesManager } = require('./preferencesManager');", '''
function run(text) {
  const manager = new PreferencesManager();
  const out = [];
  const listeners = {};
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'on') {
        const name = parts[1];
        listeners[name] = (event) => {
          if (name === 'boom') throw new Error('listener failed');
          out.push(`${name}:${event.key}=${event.value}(oldValue=${event.oldValue})`);
        };
        manager.on('committed', listeners[name]);
      } else if (parts[0] === 'off') {
        manager.off('committed', listeners[parts[1]] ?? (() => {})); // EventEmitter rejects undefined, so pass a function that was never registered
      } else if (parts[0] === 'commit') {
        manager.commit(parts[1], parts[2]);
      }
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("import java.util.function.Consumer;", '''
    static String run(String text) {
        PreferencesManager manager = new PreferencesManager();
        List<String> out = new ArrayList<>();
        Map<String, Consumer<CommitEvent>> listeners = new HashMap<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("on")) {
                    String name = parts[1];
                    listeners.put(name, event -> {
                        if (name.equals("boom")) throw new IllegalStateException("listener failed");
                        out.add(name + ":" + event.key() + "=" + event.value() + "(oldValue=" + event.oldValue() + ")");
                    });
                    manager.on(listeners.get(name));
                } else if (parts[0].equals("off")) {
                    manager.off(listeners.get(parts[1]));
                } else if (parts[0].equals("commit")) {
                    manager.commit(parts[1], parts[2]);
                }
            } catch (IllegalStateException e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <stdexcept>", '''
static std::string run(const std::string& text) {
    PreferencesManager manager;
    std::vector<std::string> out;
    std::map<std::string, int> handles;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "on") {
                std::string name = parts[1];
                handles[name] = manager.on([name, &out](const CommitEvent& event) {
                    if (name == "boom") throw std::runtime_error("listener failed");
                    out.push_back(name + ":" + event.key + "=" + event.value + "(oldValue=" + event.oldValue + ")");
                });
            } else if (parts[0] == "off") {
                auto it = handles.find(parts[1]);
                if (it != handles.end()) manager.off(it->second);
            } else if (parts[0] == "commit") {
                manager.commit(parts[1], parts[2]);
            }
        } catch (const std::runtime_error& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
}
''')
emit("observer", "preferences_manager", "PreferencesManager", "preferencesManager", prod, tests)


===== generator script (current version): readme_data.py =====
# Per-pattern README content and per-language notes. Facts about the source were checked at HEAD 53ac680.
P = {}
P["strategy"] = dict(
    title="Strategy: Logging Output Strategy",
    fixture="strategy",
    why="LogManager is the cleanest Strategy in the audit input: one context, one interface, three interchangeable implementations and a setter that swaps them while the program runs.",
    source=[
        "Strategy interface `LogBackend`: packages/backend/src/logging/LogBackend.ts:12-24",
        "Concrete strategies: BootstrapConsoleBackend.ts:22, JsonConsoleBackend.ts:104, PrettyConsoleBackend.ts:37 (same directory)",
        "Context `LogManager`: LogManager.ts:220; `setBackend` 255-256; delegation `backend.write` 367, `writeAccess` 412, `flush`/`close` 294-296",
        "Default strategy installed at start-up: logging-runtime.ts:18",
    ],
    shows="`LogManager` never formats or prints anything itself. Every record goes to `this.backend.write(record)`, and `setBackend` replaces the object, so the output format changes for all later records without touching the manager.",
    caveats="None beyond the usual simplification. In the source the Factory pattern (`createLoggingBackend`) picks the backend that gets passed to `setBackend`; the Factory snippet models that part separately.",
    model="A `LogManager` holds a backend with one method, `write(level, message)`, which returns the formatted line. Three backends: bootstrap (`info: text`), pretty (`[INFO] text`) and JSON (`{\"level\":\"info\",\"message\":\"text\"}`). The real code writes a record object to the console and has `flush`, `close` and `writeAccess`; those are left out. Rejecting a null backend is a rule of the model; the source's `setBackend` itself has no such check.",
    limits="The JSON backend in the Java, Python and C++ versions builds the string by concatenation, so a message containing a double quote would be escaped differently from the JavaScript version (`JSON.stringify`). The fixture avoids quotes.",
)
P["factory"] = dict(
    title="Factory: Logging Backend Factory",
    fixture="factory",
    why="It is the only Factory instance in the audit input that is not marked uncertain. It is small and has a clear error case.",
    source=[
        "`createLoggingBackend(format)`: packages/backend/src/logging/logging-runtime.ts:21-25",
        "Product interface `LogBackend`: logging/LogBackend.ts:12-24",
        "Concrete products: PrettyConsoleBackend.ts:37, JsonConsoleBackend.ts:104",
        "Caller `configureLogging`, which validates first and then calls `logManager.setBackend`: logging-runtime.ts:28-32",
    ],
    shows="The caller passes a configuration string and gets back a `LogBackend` without naming a concrete class. An absent value or `'pretty'` gives the pretty backend, `'json'` gives the JSON backend, and anything else throws before the current backend is replaced.",
    caveats="This is a simple factory function (a conditional that returns one of two classes). It is not GoF Factory Method or Abstract Factory, there is no creator hierarchy, and the function is not exported. It also lives in the same file as the Strategy evidence, so the two instances share a code area.",
    model="`create_logging_backend(format)` returns a backend that reports its `name` and can format a line. Absent value and `pretty` give pretty, `json` gives JSON, everything else (including an empty string and `JSON`) raises `logging.format must be either pretty or json`.",
    limits="The model has two products, like the source. It does not model the file-level default manager or configuration objects.",
)
P["adapter"] = dict(
    title="Adapter: Telemetry Backend Adapter Layer",
    fixture="adapter",
    why="It shows Adapter in its most literal form: the application owns an interface and one class translates it to a third-party SDK with a different call shape.",
    source=[
        "Target `TelemetryAdapter` and option type: packages/backend/src/core/telemetry/adapters/TelemetryAdapter.ts:11-48",
        "Adapter `SentryTelemetryAdapter`: adapters/SentryTelemetryAdapter.ts:71-112 (`captureMessage` 86-92, `startSpan` 103-105, `shutdown` 107-110; timeout constant at line 12)",
        "Client (registry holding `TelemetryAdapter[]`): packages/backend/src/core/telemetry/telemetry-registry.ts:16-52",
        "Adaptee: the `@sentry/node` module, not part of the repository source",
    ],
    shows="The registry only calls `captureMessage`, `startSpan` and `shutdown` on `TelemetryAdapter`. `SentryTelemetryAdapter` turns `(message, {level, userId})` into `Sentry.captureMessage(message, {level, user: {id}, extra})`, wraps `startSpan(name, fn)` as `Sentry.startSpan({name}, fn)`, and calls `Sentry.close(5000)` on shutdown.",
    caveats="Only one adapter exists in the repository, so the adapter layer's value is mostly prospective. In the model, two instances of the same adapter class are used to exercise the registry's fan-out and span nesting; that is not a second backend.",
    model="`SentryTelemetryAdapter` translates to a fake Sentry client that records the calls it receives. The registry fans messages out to all adapters, nests spans (outermost adapter first) and runs the function directly when there are no adapters. An error thrown inside a span passes through unchanged. The fake client is part of the test, not the production file.",
    limits="`extra`, `getActiveTraceContext` and the Promise/async parts of the source are left out.",
)
P["template_method"] = dict(
    title="Template Method: Misskey Chart Processing Framework",
    fixture="template_method",
    why="`Chart.tick` is a textbook skeleton method with two abstract steps, and 16 chart classes fill in those steps.",
    source=[
        "Abstract class `Chart`: packages/backend/src/core/chart/core.ts:177",
        "Abstract steps `tickMajor` / `tickMinor`: core.ts:196, 201",
        "Template method `tick`: core.ts:583-584 onward (column naming, clamping, skipping empty results, persisting)",
        "Concrete charts with non-trivial hooks: core/chart/charts/instance.ts:51 (`tickMajor`), 75 (`tickMinor`); 16 files under core/chart/charts extend `Chart<` (`active-users.ts:41,45` has hooks that just return `{}`)",
        "Callers of the template method: queue/processors/TickChartsProcessorService.ts:52-54 (`chart.tick(false)`) and `resync` at core.ts:619-621",
    ],
    shows="`tick` decides which hook to call, then performs the common work (prefix and rename columns, clamp to the column range, skip when empty, update hour and day records). The subclasses only say what numbers to compute.",
    caveats="Persistence in the source goes through database repositories and is asynchronous. In the model, \"persisting\" is appending to an in-memory list.",
    model="`Chart.tick(major)` calls `tick_major` or `tick_minor`, prefixes each key with `___` and replaces `.` with `_` (as `COLUMN_PREFIX` and `COLUMN_DELIMITER` do in the source), clamps values to 0..1000, and stores the result only when it is not empty. `UsersChart` and `NotesChart` are the concrete classes; a failing chart is defined in the test.",
    limits="The source clamps with each column's declared range (`small` or `big`), not a fixed 0..1000. The grouping and the hour/day records are not modelled.",
)
P["proxy"] = dict(
    title="Proxy: AnalyticsProxy",
    fixture="proxy",
    why="`AnalyticsProxy` is a small class in a single file and implements the same interface as the object it stands in for.",
    source=[
        "Proxy `AnalyticsProxy implements AnalyticsInstance`: packages/frontend/src/analytics.ts:12-78",
        "Late binding of the real subject `setAnalytics`: analytics.ts:21-26",
        "Shared proxy instance: analytics.ts:80; real instance installed by `initAnalytics` (after dynamic `import('analytics')`)",
    ],
    shows="Application code calls `analytics.track(...)` and similar methods from the start. Until `initAnalytics` has loaded the library and called `setAnalytics`, each method returns a no-op; afterwards the same call is forwarded to the real instance. The class comment says it exists so the code works without loading the analytics module.",
    caveats="It overlaps with Null Object because it returns no-ops when the real object is missing. I classify it as Proxy because it stands in for one specific subject, shares its interface and forwards to it, with the lazily loaded library as the real subject.",
    model="`AnalyticsProxy` and `RealAnalytics` share an interface with `track`, `page` and `identify`. Before `set` the proxy returns `noop`; afterwards it returns what the real object returns (`real:track login`). A second `set` raises `Analytics instance already exists.` The source has more methods (`ready`, `on`, `storage`, ...), which are not modelled.",
    limits="The real library is replaced by a small class; lazy loading itself is not modelled, only the late binding.",
)
L = {}  # (pattern, language) -> notes
L[("strategy", "java")] = "The strategy is a nominal interface (`LogBackend`); the compiler rejects a backend without `write`, and null is rejected by an explicit check in `setBackend`."
L[("strategy", "python")] = "`LogBackend` is a `typing.Protocol` used as documentation; backends do not inherit from it and nothing is enforced at runtime, so a backend without `write` only fails when called."
L[("strategy", "javascript")] = "There is no interface at all: backends are plain classes with a `write` method (duck typing), so a missing method also only fails when called. `JSON.stringify` handles escaping here."
L[("strategy", "cpp")] = "Abstract base class with a pure virtual `write`; the backend is held through `std::shared_ptr`, so swapping it also settles ownership and lifetime. A null pointer is rejected explicitly."
L[("factory", "java")] = "Java has no free functions, so the factory is a static method on `LoggingFactory`; it returns the `LogBackend` interface type."
L[("factory", "python")] = "A module-level function; `None` and `\"pretty\"` both give the pretty backend. Products are chosen by exact string comparison."
L[("factory", "javascript")] = "A module-level function; `format == null` also matches `undefined`. Products have no declared common interface."
L[("factory", "cpp")] = "A free inline function returning `std::unique_ptr<LogBackend>`; the absent-versus-empty distinction is explicit in the type (`std::optional<std::string>`), which the other languages express with null or a sentinel."
L[("adapter", "java")] = "Both the Target and the Adaptee need declared interfaces (`TelemetryAdapter`, `SentryClient`) because the type system must know the SDK's shape; `<T> T startSpan` keeps the span's return type."
L[("adapter", "python")] = "The Target is an ABC, but the Sentry SDK shape is not declared anywhere; the adapter is handed any object with matching methods. Options are a plain dict."
L[("adapter", "javascript")] = "Neither Target nor Adaptee is declared; the registry and adapter agree only through method names, so a typo shows up at call time."
L[("adapter", "cpp")] = "Virtual functions cannot be templates, so `startSpan` is fixed to `std::string` instead of a generic return type like the TypeScript original; the closure is a `std::function`."
L[("template_method", "java")] = "`tick` is `final` and the hooks are `protected abstract`, so subclasses cannot replace the skeleton and the compiler rejects a subclass missing a hook."
L[("template_method", "python")] = "An ABC with `@abstractmethod` hooks; instantiating `Chart` directly raises `TypeError`, but nothing stops a subclass from overriding `tick`."
L[("template_method", "javascript")] = "No abstract keyword: the base hooks throw when called, and `tick` can be overridden freely. Errors from a missing hook appear only at run time."
L[("template_method", "cpp")] = "`tick` is a non-virtual public method calling protected pure virtual hooks; an abstract `Chart` cannot be instantiated, and the hooks are not part of the public interface."
L[("proxy", "java")] = "The proxy implements the same interface and checks for null on each call; the real subject is created by the caller and set once."
L[("proxy", "python")] = "Same shape as Java with an ABC as the shared interface; absence is `None` and the single-assignment rule raises `RuntimeError`."
L[("proxy", "javascript")] = "`?.` and `??` make each forwarded call one line, as in the TypeScript source. Side effect: a real object that returns `null` or `undefined` would also be replaced by the no-op value."
L[("proxy", "cpp")] = "The proxy owns the real subject through `std::unique_ptr` (set by move), so the subject's lifetime is tied to the proxy; there is no automatic null check, it is written out."

P["observer"] = dict(
    title="Observer: PreferencesManager Observer",
    fixture="observer",
    why="The audit input has five Observer instances (global events, note capture, theme manager, deck columns, preferences). I picked PreferencesManager because one class is clearly the subject, its event type is declared, and the observer registration sits in a different file.",
    source=[
        "Subject `PreferencesManager extends EventEmitter<PreferencesManagerEvents>`: packages/frontend/src/preferences/manager.ts:194",
        "Event type map `PreferencesManagerEvents`: manager.ts:105-111",
        "`commit`: skips when the value is unchanged (manager.ts:254-257), updates the state through `rewriteRawState` (244-247, called at 261), then `emit('committed', {key, value, oldValue})` inside `_save` (265-272, emit at 267)",
        "Observer registration `prefer.on('committed', ...)`: packages/frontend/src/preferences.ts:116-126",
    ],
    shows="A committed change is announced with one `emit('committed', ...)`. `preferences.ts` subscribes once and reacts by recording the update time and posting a message to the other tabs. The manager does not know who listens.",
    caveats="Subject and observer roles are not declared classes. The subject machinery (`on`, `off`, `emit`) comes from the EventEmitter3 library, and the observer is a callback function. The other four Observer instances use the same mechanism and are not implemented separately. The snippets reproduce two details of the source that are easy to miss: an unchanged value is not announced, and the event's `oldValue` equals the new value, because `_save` reads `this.s[key]` after `rewriteRawState` has already stored the new value (`s` is a plain object, so no getter intervenes). Whether that is intended is not something the source says; it is reproduced as observed, and the fixture header notes it.",
    model="`PreferencesManager.commit(key, value)` does nothing when the key already holds that value. Otherwise it stores the value and notifies every registered listener with `(key, value, oldValue)`, where `oldValue` is read after the update and so equals `value`. Listeners are called in registration order, an unsubscribed listener is not called, unsubscribing an unknown listener does nothing, and an error thrown by a listener propagates to the committer and stops the remaining listeners (this is how a synchronous emit behaves).",
    limits="Scopes, profiles, cloud sync, storage and deep comparison of non-string values are not modelled (values are strings, so plain equality stands in for `deepEqual`). The `oldValue` finding comes from reading the source; Misskey's frontend was not run.",
)
P["two_level_cache"] = dict(
    title="Two-Level Cache: RedisSingleCache L1/L2 Cache",
    fixture="two_level_cache",
    why="`RedisSingleCache` is the instance recorded in the input and its `get`/`fetch`/`set` show both levels clearly. (`RedisKVCache` right above it is the keyed sibling and is not used.)",
    source=[
        "`RedisSingleCache`: packages/backend/src/misc/cache.ts:113-205 (`get` reads memory, then Redis; `set` writes both; `fetch` falls back to the fetcher; `delete` clears both)",
        "Level 1 `MemorySingleCache`: cache.ts:340",
        "Fetcher passed in through the constructor options: cache.ts:116, 125-133",
    ],
    shows="`get()` returns the in-process value if it is fresh, otherwise reads Redis and copies the result into memory, and `fetch()` calls the fetcher only when both levels are empty, then writes both. Other worker processes share the Redis level but each has its own memory level.",
    caveats="Redis key expiry (the source sets `EX` from the lifetime) is not modelled; only the memory level expires. This pattern is about cache infrastructure: how one cache object keeps a fast in-process copy in front of a shared Redis copy and falls back to a fetcher. It is separate from Cache-Aside, which is about application code deciding when to read or fill a cache around its database; see the Cache-Aside README.",
    model="L1 is a single value with a lifetime of 100 time units and a fake clock; L2 is a key-value fake that counts reads; the fetcher returns `v1`, `v2`, ... Results are tagged with the level that answered (`fetcher`, `L2`, `L1`). `newproc` creates a second cache object on the same Redis fake to show another process finding the value in L2.",
    limits="No serialization converters, no async calls, no TTL in L2. The source awaits Redis writes on purpose (see the comment at cache.ts:178-184); the model is synchronous.",
)
P["cache_aside"] = dict(
    title="Cache-Aside: Federated Instance Cache-Aside",
    fixture="cache_aside",
    why="`FederatedInstanceService` is plain application code that asks the cache first and fills it itself, which is the defining trait of Cache-Aside.",
    source=[
        "Cache construction (a `RedisKVCache` named `federatedInstance`): packages/backend/src/core/FederatedInstanceService.ts:30",
        "`fetchOrRegister`: FederatedInstanceService.ts:50-71 (cache `get` 53, repository `findOneBy` 56, `insertOne` 59, `cache.set` 65 and 68)",
        "Second method `fetch(host)` that also caches a missing instance as null: FederatedInstanceService.ts:73-89",
        "`update` refreshes the cached copy after a write: FederatedInstanceService.ts:92-103",
    ],
    shows="The service checks `federatedInstanceCache.get(host)`, goes to the database on a miss, inserts the row if the instance is new, and then writes the result into the cache itself. The cache never loads anything on its own.",
    caveats="The cache is a `RedisKVCache` that is constructed with a `fetcher` (line 33), so it could load from the database itself (read-through) through `fetch(key)`, but these methods only call `get`/`set` and do the database lookup in the service, which is what makes them Cache-Aside. The cache is also itself two-level (that infrastructure is the Two-Level Cache snippet; this snippet is about the application code that decides when to read the cache, query the database and write the cache back) (see the Two-Level Cache snippet), so the two instances share infrastructure. Cache-Aside is about who owns the lookup logic, which in this class is the service.",
    model="A repository keyed by host with auto-increment ids, a key-value cache that can hold \"known missing\", and a service with `fetch_or_register` (returns the instance, registering it if needed) and `lookup` (the source's `fetch`; returns null if unknown and caches that). Hosts are lower-cased as a stand-in for `toPuny`. The result is tagged with where it came from: `cache`, `db` or `insert`.",
    limits="Cache expiry, Redis, the `update`/`delete` paths and the real `toPuny` conversion are not modelled. The repository's `finds`/`inserts` counters exist only so the tests can tell where a result came from.",
)
P["publish_subscribe"] = dict(
    title="Publish-Subscribe: Global Event Publication and Streaming Subscription",
    fixture="publish_subscribe",
    why="It is the clearest publisher/subscriber pair in the backend: one service publishes without knowing the consumer, and another class subscribes and forwards.",
    source=[
        "Publisher `GlobalEventService.publish` writing JSON to `redisForPub.publish`: packages/backend/src/core/GlobalEventService.ts:352-361",
        "`publishBroadcastStream` 369, `publishMainStream` 374 (same file)",
        "Subscription to the host channel: packages/backend/src/GlobalModule.ts:78 (`redis.subscribe(config.host)`)",
        "Subscriber `redisForSub.on('message', ...)`: packages/backend/src/server/api/StreamingApiServerService.ts:104",
        "Per-connection fan-out through an in-process emitter (`ev.emit(data.channel, data.message)`): StreamingApiServerService.ts:116-122",
    ],
    shows="Producers call `publishMainStream(userId, type, value)` or `publishBroadcastStream(type, value)`. The message goes to Redis, and the streaming server, which was subscribed since start-up, turns it into events for each WebSocket connection. Publishers never reference connections.",
    caveats="Redis is used as a single channel keyed by host, and the selection by `mainStream:<id>` happens afterwards in-process. The model merges both steps into one broker with channel subscriptions, so it simplifies how the source routes messages.",
    model="`Broker.subscribe(channel, handler)`, `unsubscribe`, and `publish(channel, message)` which returns how many handlers received the message. `GlobalEventService` builds the channel name (`mainStream:<userId>` or `broadcast`) and a JSON message `{\"type\":..,\"body\":..}`. A message to a channel with no subscribers is dropped (the command output shows `dropped:<channel>`), like a Redis publish with no listeners.",
    limits="No real network, no connection lifecycle, no ordering guarantees beyond registration order.",
)
P["job_queue"] = dict(
    title="Job Queue: Federation Delivery Asynchronous Job Queue",
    fixture="job_queue",
    why="Delivery of ActivityPub activities is the best-documented queue in the code: a producer, a worker that processes the job, retry settings and a skip rule.",
    source=[
        "Producer `QueueService` adds delivery jobs with a label built from the inbox URL, `deliverQueue.add` at packages/backend/src/core/QueueService.ts:166 (attempts default `?? 12` at 167) and `addBulk` at 210",
        "Worker `new Bull.Worker(QUEUE.DELIVER, ...)` calling the processor: packages/backend/src/queue/QueueProcessorService.ts:265-269",
        "Consumer `DeliverProcessorService.process(job)`: packages/backend/src/queue/processors/DeliverProcessorService.ts:53 (returns `'skip (blocked)'` for a blocked host)",
    ],
    shows="The code that produces an activity only enqueues a job and returns; a separate worker takes jobs from the BullMQ queue and runs `process` on them, and BullMQ retries a failed job up to `deliverJobMaxAttempts` (12 by default).",
    caveats="BullMQ and Redis provide the queue, persistence and retry mechanics. Misskey supplies the producer and the processor, so the model reimplements the queue itself to have something runnable.",
    model="`JobQueue.add` stores a job and returns its id; `run(processor)` takes jobs in FIFO order and retries a job when the processor throws, up to 12 attempts. `DeliverService` builds the label like the source (`https://` and `/inbox` removed), and `DeliverProcessor` skips blocked hosts, otherwise sends via a transport. Results are reported as `id:label:result@attempts`.",
    limits="No delay or back-off between attempts, no concurrency, no persistence, and a single queue. Hosts ending in `.down` always fail and hosts ending in `.flaky` fail once; those are test-fake rules, not Misskey's.",
)
P["front_controller"] = dict(
    title="Front Controller: Misskey API Front Controller",
    fixture="front_controller",
    why="All API requests pass through one component that authenticates, rate-limits and dispatches, which is what the Front Controller pattern describes.",
    source=[
        "Registration of every endpoint (loop over `endpoints`, `moduleRef.get('ep:' + name).exec`): packages/backend/src/server/api/ApiServerService.ts:65-102",
        "Controller `ApiCallService.handleRequest`: packages/backend/src/server/api/ApiCallService.ts:194 (authentication at 212); `handleMultipartRequest` 233",
        "Rate limiting: ApiCallService.ts:387-391",
        "Dispatch `ep.exec(...)`: ApiCallService.ts:498",
    ],
    shows="Whatever the endpoint, the request goes through the same `handleRequest`: look up the credential, apply the endpoint's rate limit, then call the endpoint's `exec`. Endpoint classes do not repeat that logic.",
    caveats="Fastify gets one route per endpoint (the loop in `ApiServerService`), not a single route that dispatches by name. The shared pre-processing sits in `ApiCallService`, so I treat it as a Front Controller with a framework doing the routing, not a literal single-entry servlet.",
    model="`ApiController.handle(name, token, body)` returns a status and text. It answers 404 for an unknown endpoint, 401 when the endpoint needs a credential and the token does not resolve to a user, 429 when the actor has already made two successful requests, and otherwise 200 with the endpoint's result. Actors are the user or `anon`. The three endpoints (`ping`, `notes/create`, `i`) are defined by the test.",
    limits="Parameter validation, multipart handling, time windows and the API's real error format are not modelled. The rate limit is the model's own simplification: in the source it applies only when the endpoint declares `meta.limit`, is keyed per endpoint (`limit.key = ep.name`, ApiCallService.ts:368-391) and uses a user id or an IP hash as the actor; the model uses one fixed limit of 2 calls per actor across all endpoints and never resets it.",
)
P["router"] = dict(
    title="Router: Nirax Frontend Router",
    fixture="router",
    why="Nirax is Misskey's own router and has a clear resolve, navigate and notify cycle.",
    source=[
        "`Nirax extends EventEmitter<RouterEvents>`: packages/frontend/src/lib/nirax.ts:218",
        "`resolve(fullPath)` splits path, query and hash and matches route definitions: nirax.ts:257 onward",
        "`navigate` with the login-required handling and `emit('change', ...)`: nirax.ts:411-430 (emit at 425)",
        "Catch-all route `path: '/:(*)'`: packages/frontend/src/router.definition.ts:607",
    ],
    shows="A path is parsed into a route plus parameters, the router becomes that route, and `change` is emitted so the UI can swap the page. A route that requires login shows the not-found component with a login popup flag when the user is logged out.",
    caveats="Router is an architectural/UI pattern, not GoF. In the source the router is also an Observer subject (its `change` event), which I use in the model for the change counter.",
    model="Routes are `(path, component, loginRequired)`. `:name` segments capture parameters. `navigate(path)` returns the component, params, query and hash; if the route needs login and the user is logged out, the component becomes `notfound` and `popup` is set. A change event is emitted for matched routes only; an unmatched path resolves to `notfound` without an event, as with the catch-all in the source.",
    limits="No history, no nested routes, no `resolveForNavigation`, no redirects, and no query parsing beyond keeping the raw string.",
)
P["service_layer"] = dict(
    title="Service Layer: Misskey Core Application Service Layer",
    fixture="service_layer",
    why="`AnnouncementService` is the smallest service that combines persistence, event publication and moderation logging, and an endpoint class that calls it.",
    source=[
        "`AnnouncementService` (injected repositories, `IdService`, `GlobalEventService`, `ModerationLogService`): packages/backend/src/core/AnnouncementService.ts:10-31",
        "Use cases: `getUnreadAnnouncements` 45, `create` 69, `update` 121, `delete` 160, `getAnnouncement` 183, `read` 202-224 (same file)",
        "Caller: packages/backend/src/server/api/endpoints/admin/announcements/create.ts:72-75 (`announcementService.create`)",
        "Module wiring: packages/backend/src/core/CoreModule.ts:168, 321",
    ],
    shows="An endpoint calls one method, and the service decides everything the operation involves: it inserts the row, publishes the right event (to one user or to everyone), and writes a moderation log entry when a moderator did it. `read` ignores duplicates, deactivates a user's own announcement and announces when nothing is left unread.",
    caveats="\"Service Layer\" is a broad architectural label. The evidence here is the use-case boundary of one service plus the 76 `*Service.ts` files in `core/`; I read only this one in detail.",
    model="`AnnouncementService` is built from a repository, an event publisher and a moderation log (all injected). `create` publishes `announcementCreated` to `main:<user>` or `broadcast` and logs when a moderator is given; `unread(user)` lists active announcements visible to the user that they have not read; `read` follows the source's rules; `get` raises `not found` for unknown ids and for other users' private announcements. Output lines for events and logs appear in order, and a `deactivated#id` line is a state check made after a `read`.",
    limits="No packing/serialization, no `update`/`delete`, no pagination, ids come from a counter and `isActive`/`isRead` are simplified.",
)
P["plugin_architecture"] = dict(
    title="Plugin Architecture: Misskey Frontend Plugin Architecture",
    fixture="plugin_architecture",
    why="The frontend has an explicit host (install, launch, abort), a handler registry and call sites that apply the registered handlers, so the extension points are easy to see.",
    source=[
        "`installPlugin`: packages/frontend/src/plugin.ts:136",
        "Handler registry `pluginHandlers` and `addPluginHandler`: plugin.ts:227-236",
        "`launchPlugins`/`launchPlugin` (script exec, error is logged and rethrown): plugin.ts:238-311",
        "`abortPlugin` (drops the context and the plugin's handlers): plugin.ts:313-320",
        "Handler registrations such as `note_view_interruptor`: plugin.ts:381-427; lookup `getPluginHandlers`: plugin.ts:462-463",
    ],
    shows="A plugin is a script that, while running, registers handlers for named extension points. The host only keeps the list and hands out handlers by type when asked, and aborting a plugin removes its handlers.",
    caveats="The source's plugins are AiScript programs run in a sandbox; the extension-point registry is the part I model. The host is one module (not a separate kernel process), so \"microkernel\" is used loosely.",
    model="`PluginHost.install(id, setup)` records the plugin and runs `setup`, which can add handlers through a callback; `abort(id)` removes the plugin's handlers; `get_handlers(type)` returns them in installation order. If `setup` throws, the error propagates and handlers registered before the error stay until `abort`, which is what the source does (nothing in `launchPlugin` removes them). The test defines four plugins: `upper`, `exclaim`, `share` and `bad`.",
    limits="No sandbox, no plugin metadata or permissions, no persistence, no log, and only two handler types are exercised.",
)
P["repository"] = dict(
    title="Repository: Misskey Persistence Repository Layer",
    fixture="repository",
    why="It is the persistence abstraction every service uses. The audit marked it as a weaker fit, so this README is explicit about what the source does and does not show.",
    source=[
        "Extension interface `MiRepository<T>` and implementation `miRepository.insertOne`: packages/backend/src/models/_.ts:89-97",
        "Typed repositories such as `UsersRepository = Repository<MiUser> & MiRepository<MiUser>`: models/_.ts:184 (`AnnouncementsRepository`), 229 (`UsersRepository`)",
        "Provider that builds each repository: packages/backend/src/models/RepositoryModule.ts:91-95 (`db.getRepository(MiUser).extend(miRepository)`)",
        "Clients: services such as `UserService` and `AnnouncementService` get repositories injected through DI tokens",
    ],
    shows="Services do not touch the data source. They receive a repository object (`DI.usersRepository`) and call `findOneBy`, `update`, `insertOne` and similar on it, so persistence is hidden behind that object and swapped by DI.",
    caveats="The repository abstraction comes from TypeORM's `Repository<T>`, not from Misskey. Misskey adds the DI wiring and one extension method (`insertOne`) and does not define a domain-specific repository interface. I count it as the Repository pattern by way of a framework idiom, and I'm not claiming Misskey designed its own.",
    model="The cross-language example models the repository collaboration with an in-memory store. It does not reproduce TypeORM. `InMemoryRepository` plays `Repository<T>` (`insert`, `findOneBy`, `findOneOrFail`, `count`), `MiRepository` adds `insertOne` (insert, then read the row back by its identifiers) and is mixed in to give `UsersRepository`, and `UserService` receives it through its constructor.",
    limits="No SQL, relations, transactions, entity metadata or DI container; entities are string maps.",
)
L[("observer", "java")] = "An own listener list of `Consumer<CommitEvent>`; `off` removes by object identity and notification iterates over a copy, so a listener can unsubscribe while being notified. There is only one event type, so there are no event names."
L[("observer", "python")] = "A plain list of callables with a `namedtuple` event; single event type, no event names. Notification iterates over a copy of the list."
L[("observer", "javascript")] = "The subject extends Node's built-in `EventEmitter`, so `on`/`off`/`emit` come from the runtime (the TypeScript source uses EventEmitter3 the same way). `off` with an undefined listener throws a TypeError, so the test passes a never-registered function for the unknown-listener case."
L[("observer", "cpp")] = "`std::function` objects cannot be compared, so `on` returns an integer handle that `off` takes; notification runs over a copy of the listener list."
L[("two_level_cache", "java")] = "Absent is `null` (no `Optional`); the second level is a `RemoteStore` interface and the clock is a `LongSupplier`."
L[("two_level_cache", "python")] = "Absent is `None`; the Redis object and the clock are plain duck-typed collaborators."
L[("two_level_cache", "javascript")] = "Absent is `undefined`, as in the TypeScript source; synchronous here, where the source awaits Redis."
L[("two_level_cache", "cpp")] = "`std::optional<std::string>` makes absence part of the type; Redis is reached through a `RemoteStore&`, so the cache does not own it; `delete` is renamed `remove` because it is a keyword."
L[("cache_aside", "java")] = "A `HashMap` may hold null, so a cached \"not found\" can only be told apart from a miss with `containsKey` (the `has` method); `Instance` is a record."
L[("cache_aside", "python")] = "A dict holding `None` for known-missing hosts, so `has` is needed; the entity is a `namedtuple`."
L[("cache_aside", "javascript")] = "`Map` with `null` for known-missing; `fetchOrRegister` uses a truthiness check, so a cached null counts as a miss there, as in the source's `if (cached)`."
L[("cache_aside", "cpp")] = "Known-missing is an empty `std::optional<Instance>` stored in the map; repository and cache are injected by reference."
L[("publish_subscribe", "java")] = "Handlers are `BiConsumer<String,String>` and unsubscribe works by object identity; JSON is built by string concatenation."
L[("publish_subscribe", "python")] = "Handlers are callables; the message is built with `json.dumps` using compact separators."
L[("publish_subscribe", "javascript")] = "Handlers are functions in a `Map` of arrays; `JSON.stringify` builds the message."
L[("publish_subscribe", "cpp")] = "Handlers are `std::function`, which cannot be compared, so `subscribe` returns a token for `unsubscribe`; JSON is built by concatenation."
L[("job_queue", "java")] = "Processor is a `Function<Job,String>`; a failing attempt is any `RuntimeException`; `Job` and `JobResult` are records."
L[("job_queue", "python")] = "Processor is any callable; only `RuntimeError` counts as a failed attempt, other exception types would propagate and stop the run."
L[("job_queue", "javascript")] = "Any thrown value counts as a failed attempt (there are no checked or typed exceptions to filter on)."
L[("job_queue", "cpp")] = "Only `std::runtime_error` counts as a failed attempt; the result is held in a `std::optional<std::string>` until a processor call succeeds."
L[("front_controller", "java")] = "`Endpoint` is a record holding a `BiFunction`; the authenticator returns null for an unknown token."
L[("front_controller", "python")] = "`Endpoint` is a `namedtuple` and the authenticator any callable returning a user or `None`."
L[("front_controller", "javascript")] = "Endpoints are plain objects; `??` turns a missing user into the `anon` actor."
L[("front_controller", "cpp")] = "The user is a `std::optional<std::string>`; the method is called `registerEndpoint` because `register` is a C++ keyword."
L[("router", "java")] = "`Route` and `Resolved` are records, and an unmatched path is a `Resolved` with a null route (the catch-all)."
L[("router", "python")] = "`Resolved` is a `namedtuple` and `_replace` creates the login-required variant; matching uses `for ... else`."
L[("router", "javascript")] = "Object spread builds the modified result; path pieces come from `split` and destructuring defaults."
L[("router", "cpp")] = "`Resolved` has a `matched` flag instead of a nullable route; the standard library has no split, so segments are split by hand."
L[("service_layer", "java")] = "Collaborators are constructor-injected interfaces (`EventPublisher`, `ModerationLog`); `Packed.read` is a boxed `Boolean` so null can mean \"no user given\"."
L[("service_layer", "python")] = "The entity is a dataclass and collaborators are duck-typed objects; `LookupError` stands for the not-found error."
L[("service_layer", "javascript")] = "Entities are object literals and missing values are `null`; collaborators are plain objects with the right methods."
L[("service_layer", "cpp")] = "Collaborators are abstract classes held by reference; the repository's `find` returns a non-owning raw pointer (null when missing) and the read flag is a `std::optional<bool>`."
L[("plugin_architecture", "java")] = "`setup` is a `Consumer<HandlerRegistrar>` and handlers are `Function<String,String>`; a private record holds the registry entries."
L[("plugin_architecture", "python")] = "`setup` receives an `add_handler` closure; handlers are plain callables stored in tuples."
L[("plugin_architecture", "javascript")] = "Same closure-based registration; handlers are arrow functions and the registry holds plain objects."
L[("plugin_architecture", "cpp")] = "Handlers are `std::function` values the host owns; an exception thrown from `setup` propagates through `install` and handlers added before it remain registered."
L[("repository", "java")] = "`MiRepository` is an interface whose default method `insertOne` is mixed into `UsersRepository` (`extends InMemoryRepository implements MiRepository`)."
L[("repository", "python")] = "`MiRepository` is a mixin listed before `InMemoryRepository` in the bases, so its `insert_one` calls the other base's `insert` and `find_one_or_fail`."
L[("repository", "javascript")] = "`extend(repository, miRepository)` copies the method onto the instance, like `.extend(miRepository)` in the TypeScript source."
L[("repository", "cpp")] = "`MiRepository<Base>` is a class template deriving from the repository, so the mixin is resolved at compile time; entities are `std::map<string,string>`."

STATUS = {
    "factory": "Confirmed with caveat. The source has a private, simple factory function with one caller. There is no creator hierarchy, so it counts as Factory only in the \"simple factory\" sense, not as Factory Method or Abstract Factory.",
    "adapter": "Confirmed with caveat. The translation to the Sentry SDK is real, but there is only one adapter and the target interface was shaped around Sentry's features, so the benefit of the layer is partly prospective.",
    "cache_aside": "Confirmed with caveat. The two service methods follow Cache-Aside, but the cache object they use is itself a read-through-capable, two-level cache. The overlap with the Two-Level Cache snippet is deliberate: that one covers the cache infrastructure, this one covers the application's own read, query and write-back logic.",
    "front_controller": "Confirmed with caveat. A shared handler authenticates, rate-limits and dispatches every API call, but Fastify gets one route per endpoint and the real rate limit is optional and per endpoint. There is no single entry route.",
    "service_layer": "Confirmed with caveat, for this service only. I read `AnnouncementService` and its caller in detail; the other 75 `*Service.ts` files and `CoreModule.ts` were not read, so the claim about the whole layer rests on naming and structure, not on checked behaviour.",
    "repository": "Confirmed with caveat, as a framework idiom. The repository abstraction is TypeORM's `Repository<T>`; Misskey adds DI wiring and one extension method and defines no repository interface of its own.",
}


===== generator script (current version): gen_readme.py =====
import os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
from readme_data import P, L, STATUS
TEAM = os.path.expanduser("~/design_patterns_case_study/TEAM_TEMPLATE")
CODE = os.path.join(TEAM, "Part3/code")
LANG = {"java": "Java", "python": "Python", "javascript": "JavaScript", "cpp": "C++"}
def lang_files(d):
    fs = sorted(f for f in os.listdir(d) if f != "README.md")
    prod = [f for f in fs if not re.search(r"(Test\.java|^test_.*\.py|\.test\.js|\.test\.cpp)$", f)][0]
    test = [f for f in fs if f != prod][0]
    return prod, test
def cmds(lang, prod, test, fixture):
    fx = "../../../test-cases/%s.txt" % fixture
    if lang == "java":
        cls = test[:-5]
        return ["javac -d build *.java", "java -cp build %s %s" % (cls, fx)]
    if lang == "python":
        return ["python3 -B %s %s" % (test, fx)]
    if lang == "javascript":
        return ["node %s %s" % (test, fx)]
    return ["mkdir -p build", "g++ -std=c++17 -Wall -Wextra -o build/test %s" % test, "build/test %s" % fx]
for p in sys.argv[1:]:
    d = P[p]
    n = sum(1 for l in open(os.path.join(TEAM, "Part3/test-cases/%s.txt" % d["fixture"])) if l.strip() and not l.startswith("#"))
    body = ("# %s\n\n" % d["title"]) + (("**Status:** " + STATUS[p] + "\n\n") if p in STATUS else "") + "**Why this instance:** %s\n\n**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):\n\n%s\n\n**How the source shows the pattern:** %s\n\n**Caveats:** %s\n\n**The small model:** %s\n\n**Not modelled:** %s\n\n**Shared test cases:** `Part3/test-cases/%s.txt` has %d cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.\n" % (
        d["why"], "\n".join("- " + s for s in d["source"]), d["shows"], d["caveats"], d["model"], d["limits"], d["fixture"], n)
    open(os.path.join(CODE, "pattern_" + p, "README.md"), "w").write(body)
    for lang, name in LANG.items():
        ld = os.path.join(CODE, "pattern_" + p, lang)
        prod, test = lang_files(ld)
        c = cmds(lang, prod, test, d["fixture"])
        txt = "# %s: %s\n\n- Production code: `%s`\n- Test runner: `%s` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)\n\nRun from `Part3/code/pattern_%s/%s/`:\n\n```\n%s\n```\n\nRemove the `build/` folder afterwards if one was created; compiled output is not part of the submission.\n\n**Language notes:** %s\n" % (
            d["title"].split(":")[0], name, prod, test, p, lang, "\n".join(c), L[(p, lang)])
        open(os.path.join(ld, "README.md"), "w").write(txt)
print("ok")

