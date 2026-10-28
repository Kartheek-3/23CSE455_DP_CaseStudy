Assistant text output for prompts 1-5 (scope selection and source verification).
Tool calls and their results (greps, file reads) are not included.

===== assistant message (2026-10-10T10:07:30.579Z) =====
I'll start by reading the assignment's Part 3 requirements and the existing audit evidence.

===== assistant message (2026-10-10T10:07:55.812Z) =====
## Proposed Part 3 plan (nothing implemented yet)

### What the assignment requires
- One small problem per **confirmed pattern type**, implemented in Java, Python, JavaScript and C++ with the same inputs and expected outputs.
- Each language directory holds production code, a separate test runner and a README.
- The cross-language CSV has 11 columns. The PDF names it `pattern_crosslanguage.csv` and places it under `Part3/llm/`, but also says not to duplicate the datasets. The template puts the canonical copy in `data/`.
- `llm.csv` has 7 columns, `part3_prompt.txt` is required, and the slide file is `A1_slide.pdf`.

### Proposed pattern types (5)
The PDF says "each detected pattern type", so this is a choice about which confirmed types count.

| Pattern | Instance to model | Source evidence | Status |
|---|---|---|---|
| **Strategy** | Logging Output Strategy (`LogManager` and `LogBackend`, with Bootstrap, Json and Pretty backends) | Audit VALID; HEAD ranges shifted slightly, which I'll re-verify | Confirmed |
| **Adapter** | Telemetry Backend Adapter (`TelemetryAdapter` and `SentryTelemetryAdapter`) | Audit VALID | Confirmed (only one adapter exists) |
| **Template Method** | Chart Processing Framework (`tick()` calling abstract `tickMajor`/`tickMinor`) | Audit VALID, 16 subclasses | Confirmed |
| **Proxy** | AnalyticsProxy (forwards to an optional inner instance, falls back to a no-op) | Audit VALID | Confirmed |
| **Observer** | PreferencesManager (`EventEmitter` emitting `committed`) or Theme Manager | Audit VALID, 5 instances | Confirmed |

**Factory** also has a VALID instance (`createLoggingBackend`), but it is a simple factory function and shares its source evidence with the Strategy instance. I propose to leave it out or fold it into the Strategy problem. If you want all of the types in `pattern_counts.csv`, I'd add it as a sixth, small problem.

### Excluded, and why
- **UNCERTAIN:** Object Pool, Mediator, Streaming Connection Factory. The audit says they don't fit the GoF form.
- **CHANGED / weak:** Repository, which is a thin TypeORM extension. The Deck Column Observer has a changed path but is only another Observer instance.
- **Architectural/enterprise patterns:** Pub-Sub, Job Queue, Cache-Aside, Two-Level Cache, Front Controller, Router, Service Layer, Plugin. These are valid but are framework-dependent and don't give a meaningful four-language comparison. The template scaffold also lists only Factory, Proxy, Observer, Strategy, Adapter and Template Method.
- **New candidates** (Channel Strategy, ModuleRef Factory, RedisKVCache): not confirmed, so not used.

### Uncertainties
1. **Pattern scope.** I recommend the 5 above, the audit's GoF-style VALID patterns, and I'd add Factory only if your rubric demands every GoF type found.
2. **Index freshness.** `misskey/` HEAD is `53ac680`, matching the audit. The original CSV is at `5f50134`. I'll re-read the exact source ranges for the 5 chosen instances at HEAD and use HEAD as `source_loc`'s basis.
3. **Dataset location.** `pattern_crosslanguage.csv` is in `data/` per the template and CLAUDE.md's one-copy rule, but the PDF tree puts it in `Part3/llm/`. I'll keep one copy in `data/` and note the ambiguity, unless you tell me otherwise.
4. **Team name.** `A1_slide.pdf` needs a real team ID and content, and I don't have them. I'll leave the slide for last and won't fabricate it.
5. **Complexity tool.** `lizard` and `radon` are not installed. I'll use a documented manual decision-point counting rule, or `pip install lizard` in a venv if you approve.
6. **Cyclomatic complexity** will be recorded as max per function using one rule across all four languages.

### Tooling available
Java 17.0.19 (javac), Python 3.14.6, Node v24.15.0, g++ 16.1.1.

### Files I intend to create (inside `TEAM_TEMPLATE/Part3/`, reusing existing scaffold dirs)
- `pattern_strategy/`, `pattern_adapter/`, `pattern_template_method/`, `pattern_proxy/`, `pattern_observer/`, each with `{java,python,javascript,cpp}/`. Each language directory gets production code, a test file, a README and a raw timing log. Each pattern directory also has a short per-pattern README that states the shared problem and the expected outputs.
- `pattern_factory/` stays untouched unless you approve the sixth pattern.
- `Part3/llm/part3_prompt.txt`, `Part3/llm/llm.csv`
- `data/pattern_crosslanguage.csv` (20 rows: 5 patterns × 4 languages)
- `Part3/llm/A1_slide.pdf` is deferred until the team ID is known.

I'll also remove nothing from the template, and `slide_outline.md` stays as is.

**Please confirm:**
1. The 5 patterns, with or without Factory.
2. Keeping the CSV in `data/` only.
3. Whether I may `pip install lizard` in a venv.

===== assistant message (2026-10-10T11:00:44.393Z) =====
Nothing is implemented yet. Everything below comes from the recorded audit data plus targeted source checks at HEAD.

## Index and source freshness
- **Code index:** the pre-built index of the Misskey checkout is ready, indexed 2026-10-10.
- **Coverage:** the 7 cited key files have index metadata matching the checkout and no recorded issues. This is a best-effort signal, so I still checked the source directly.
- **Checkout:** `misskey/` is at `53ac6808…`, with a clean working tree. The recorded CSV commit is `5f501341…`.

## 1. Confirmed pattern types and proposed representative instances
`audit-input/pattern_counts.csv` has 17 distinct types and 22 instances. 15 types have a verified or weakly verified instance. Mediator and Object Pool are excluded because their only instances are UNCERTAIN.

| # | Pattern type | Proposed instance | HEAD evidence checked |
|---|---|---|---|
| 1 | Strategy | Logging Output Strategy | `LogBackend.ts:12-24`; `LogManager.setBackend` (255), `backend.write` (367) |
| 2 | Factory | Logging Backend Factory | `logging-runtime.ts` `createLoggingBackend` (21-27); invalid format throws |
| 3 | Adapter | Telemetry Backend Adapter | `TelemetryAdapter.ts:27`; `SentryTelemetryAdapter implements TelemetryAdapter` (71) |
| 4 | Template Method | Chart Processing Framework | `chart/core.ts:177,196,201`; `tick()` calls `tickMajor`/`tickMinor` (583-584) |
| 5 | Proxy | AnalyticsProxy | `frontend/src/analytics.ts:12-78`; forwards via `this.analytics?.…` with no-op fallback |
| 6 | Observer | PreferencesManager Observer | `preferences/manager.ts:194,267`; `preferences.ts:116` |
| 7 | Two-Level Cache | RedisSingleCache L1/L2 | `misc/cache.ts:113-175` (memory, then Redis, then fetcher) |
| 8 | Cache-Aside | Federated Instance Cache-Aside | `FederatedInstanceService.ts:49-60` (get, DB load on miss, then set) |
| 9 | Publish-Subscribe | Global Redis Event Publication and Streaming Subscription | `GlobalEventService.ts:341-357`; `StreamingApiServerService.ts:27-28,104` |
| 10 | Job Queue | Federation Delivery Job Queue | `QueueService.ts:166,210`; `DeliverProcessorService.process` (53) |
| 11 | Front Controller | Misskey API Front Controller | `ApiServerService.ts:65`; `ApiCallService.ts:498` (`ep.exec`) |
| 12 | Router | Nirax Frontend Router | `nirax.ts:257 resolve`, `411 navigate` |
| 13 | Service Layer | Core Application Service Layer (`AnnouncementService`) | `AnnouncementService.ts:10-31` (injected repos + `GlobalEventService`) |
| 14 | Plugin Architecture | Frontend Plugin Architecture | `plugin.ts:136,229,238,313` |
| 15 | Repository | Persistence Repository Layer | `models/_.ts:90-95`; `RepositoryModule.ts:91-95` |

## 2. Genuine uncertainties
- **Excluded (UNCERTAIN):**
  - Mediator: Stream is closer to a Facade or coordinator.
  - Object Pool: the "pool" is ref-counted sharing, not an object pool.
  - The Streaming Connection Factory instance also stays out.
- **Not confirmed:** the 3 new candidates (Channel Strategy, ModuleRef Factory, RedisKVCache). They stay excluded. RedisKVCache is only a sibling of #7, which I'm using.
- **Weak fits you should decide on:**
  - Repository (#15) is a thin TypeORM `insertOne` extension, marked CHANGED in the audit.
  - Service Layer (#13) is a broad architectural label.
  - Adapter (#3) has only one concrete adapter.
  - Factory (#2) is a simple factory function that shares evidence with Strategy (#1).
- **Architectural patterns (#7–#15):** these depend on Redis, BullMQ, TypeORM and Vue. The cross-language snippets would model the collaboration with in-memory fakes, and each README would say so.
- **Scale:** 15 types × 4 languages is 60 implementations. The report says "each confirmed pattern type… no quota", so this follows the template. I can do the 6 GoF-style types first (#1–#6) and then the 9 architectural ones, if you prefer.
- **Line ranges:** I checked symbols at HEAD, not every cited range. Full range verification happens per instance during implementation, and I'll record any shifts.

## 3. PDF conflicts affecting Part 3

| Item | `DP_Csestudy.pdf` | `DP_Csestudy_report.pdf` | Proposed resolution |
|---|---|---|---|
| Cross-language CSV | `pattern_crosslanguage.csv` in `Part3/llm/` | `data/cross_language.csv` | One copy at `data/cross_language.csv` (newer template, as you directed). The 11 columns are identical in both. |
| LLM CSV | `Part3/llm/llm.csv` | `data/llm.csv` | One copy at `data/llm.csv`, using the `part` column to separate parts. |
| Part3 layout | `Part3/<pattern>/{java,python,javascript,cpp}`, `llm/` | `Part3/`: report PDF, `code/`, `test-cases/`, `evidence/`, `llm/` | Use the newer layout, with pattern directories under `Part3/code/`. |
| Slide | `A1_slide.pdf` in `Part3/llm/` | Not mentioned | Defer. The team ID and content are not established. |
| Report filenames | `A1_Report.pdf` + `.tex` | `A1_Report.tex` + `A1_Final_Report.pdf` | Outside Part 3. I'll note it and not decide it. |
| Pattern scope | "each detected pattern type" | "each confirmed pattern type", no quota | Use only confirmed types, as above. |

Separately, `audit-input/pattern_counts.csv` uses a `pattern_type` column, not the required `source_version,summary,pattern_name,count` schema. That is a Part 1 issue and I'm leaving it.

## 4. Paths

**Existing, reused (the template's six empty pattern directories get relocated, not duplicated):**
- `TEAM_TEMPLATE/Part3/README.md` (update)
- `TEAM_TEMPLATE/Part3/llm/part3_prompt.txt` (fill)
- `TEAM_TEMPLATE/Part3/llm/README.md` and `slide_outline.md` (untouched)
- `TEAM_TEMPLATE/Part3/pattern_{strategy,factory,adapter,template_method,proxy,observer}/{java,python,javascript,cpp}/` (all empty)
- `TEAM_TEMPLATE/data/pattern_crosslanguage.csv` (header only)
- `TEAM_TEMPLATE/Part3/llm/llm.csv` (header only)

**New:**
- `Part3/code/<pattern>/{java,python,javascript,cpp}/`: production code, separate tests, and a README per language. Each pattern also gets a short README with the shared problem.
- `Part3/test-cases/<pattern>.json`: shared inputs and expected outputs, read by all four test runners.
- `Part3/evidence/{test-logs,timing,loc-cc}/`: raw test logs, the raw timing runs and the LOC/complexity outputs.
- `Part3/llm/{prompts,inputs,outputs,verification}/`: exact prompt, input context, raw output and verification notes for each major analysis.
- `data/cross_language.csv`: renamed from the template's `pattern_crosslanguage.csv`.
- `data/llm.csv`: new, with the 7 PDF columns.

**Not created:** the report `.tex`/PDF content, the slide, the team ID, screenshots, and Part 1/2 files.

## 5. Decisions needed
1. **Scope:** all 15 types, 15 with Repository flagged as weak, or GoF-style (#1–#6) first? I recommend all 15 in two batches, with Repository and Service Layer marked "weak fit" in `language_notes`.
2. **Layout:** may I move the six empty template pattern directories under `Part3/code/` and rename the CSV to `data/cross_language.csv`? I'd also leave the duplicate `Part3/llm/llm.csv` stub empty rather than delete it.
3. **LLM records:**
   - The displayed model is Sonnet 5.5 (`claude-sonnet-5-5`). I don't know the access tier, so please tell me and I'll record it.
   - Every verification row will be marked "pending human review", with reviewer blank until you review it. I won't claim you verified anything.
4. **Complexity tool:** may I `pip install lizard` into a venv in the scratchpad? It gives one consistent counting rule across all four languages.

===== assistant message (2026-10-10T11:13:03.678Z) =====
## Resolved weak classifications

**Repository → confirmed, with its origin recorded as a framework idiom.**
- `models/_.ts:89-97` defines `MiRepository<T>` with `insertOne`, plus a `miRepository` implementation.
- `models/_.ts:184,229` define `UsersRepository = Repository<MiUser> & MiRepository<MiUser>` and similar types per entity.
- `RepositoryModule.ts:91-95` registers each one under a DI token via `db.getRepository(MiUser).extend(miRepository)`.
- Services such as `AnnouncementService` depend on these injected repository types, not on the data source. There are about 40 `insertOne` call sites.
- Misskey adds no domain-specific repository interface. The collection-like abstraction comes from TypeORM's `Repository<T>`, which Misskey extends and injects.
- The role mapping will therefore say "framework / dependency" origin, and `language_notes` will state that the snippet models the collaboration with an in-memory store.

**Service Layer → confirmed.**
- `AnnouncementService` is `@Injectable()` and holds two repositories plus `IdService`, `GlobalEventService` and `ModerationLogService`.
- Its `create`, `update`, `delete` and `read` methods (lines 69-221) each combine persistence, event publication and moderation logging.
- `admin/announcements/create.ts:72,75` injects the service and delegates to `announcementService.create`.
- There are 76 `*Service.ts` files under `core/`, so the layer is systematic and not a one-off.

## Existing content check
Everything in the template is boilerplate, so there is no useful content to preserve beyond what I'll reuse:
- **`Part3/pattern_*/{lang}/README.md` (30 files) and the 6 pattern READMEs:** generic placeholders of about 380 bytes with no project-specific content. They'll be replaced by real READMEs.
- **`Part3/llm/llm.csv` and `data/pattern_crosslanguage.csv`:** header-only stubs. The first duplicates the future `data/llm.csv`, and the second becomes `data/cross_language.csv` (same 11 columns).
- **Kept as-is:**
  - `Part3/llm/part3_prompt.txt` is a checklist stub and will be overwritten with real prompts.
  - `slide_outline.md` stays untouched.
  - `data/README.md` and `Part3/README.md` need name and layout updates only.

Once you approve, I'd remove the 6 `pattern_*` directories, the empty `Part3/llm/llm.csv`, and rename the CSV. Nothing else would move or be deleted, and no other templates or originals are touched.

## Final confirmed list: 15 types, 15 instances

| # | Type | Instance | Status |
|---|---|---|---|
| 1 | Strategy | Logging Output Strategy | confirmed |
| 2 | Factory | Logging Backend Factory | confirmed (simple factory function) |
| 3 | Adapter | Telemetry Backend Adapter Layer | confirmed (single adapter) |
| 4 | Template Method | Chart Processing Framework | confirmed |
| 5 | Proxy | AnalyticsProxy | confirmed (also null-object fallback) |
| 6 | Observer | PreferencesManager Observer | confirmed |
| 7 | Two-Level Cache | RedisSingleCache L1/L2 | confirmed |
| 8 | Cache-Aside | Federated Instance Cache-Aside | confirmed |
| 9 | Publish-Subscribe | Global Redis Event Publication and Streaming Subscription | confirmed |
| 10 | Job Queue | Federation Delivery Asynchronous Job Queue | confirmed |
| 11 | Front Controller | Misskey API Front Controller | confirmed |
| 12 | Router | Nirax Frontend Router | confirmed |
| 13 | Service Layer | Core Application Service Layer (`AnnouncementService`) | confirmed |
| 14 | Plugin Architecture | Frontend Plugin Architecture | confirmed |
| 15 | Repository | Persistence Repository Layer | confirmed (framework idiom) |

**Kept separate, not implemented:**
- Mediator (UNCERTAIN)
- Object Pool (UNCERTAIN)
- Streaming Connection Factory (UNCERTAIN)
- Channel Strategy, ModuleRef Factory and RedisKVCache (new unconfirmed candidates)

## Remaining uncertainty
- **Factory:** this is a simple factory function in the same module as Strategy. If the reviewer expects a Factory Method or Abstract Factory, it may be judged weak. I'll show it as a function with no invented classes.
- **Adapter:** it has one adapter and one adaptee. The snippet will use a fake third-party SDK to show the wrap.
- **Architectural patterns (#7-#15):** the framework calls (Redis, BullMQ, Vue, TypeORM) are replaced with in-memory fakes in all four languages. Each README will say this explicitly.
- **Line ranges:** these were verified by symbol at HEAD. I'll recheck the exact ranges for each instance when I write its source-location record.
- **Access tier:** still unrecorded. I need you to tell me which tier the displayed Sonnet 5.5 session ran on.

## Implementation count
- 15 patterns × 4 languages = **60 production snippets**
- 60 separate test files, 15 shared fixtures (`Part3/test-cases/<pattern>.json`)
- 60 language READMEs + 15 pattern READMEs
- 60 rows in `data/cross_language.csv`
- 60 × (1 warmup + 5 timed) = 360 timed runs, logged raw under `Part3/evidence/timing/`
- Lizard (venv): Java, Python, JavaScript and C++ are all supported. Its limitations will be documented.

Reply "approved" (or give changes) and I'll proceed with the directory changes and implementation.

===== assistant message (2026-10-10T11:17:53.033Z) =====
## Count reconciliation

**The input has 22 rows, not 23.** `patterns.csv` has 23 lines because of the header row, and `pattern_counts.csv` sums to 22. `audit-results/validation.csv` also has 22 rows, so no row is missing. Nothing was modified.

My earlier "15" counted pattern types, not instances. That conflated two different units, and the table below separates them.

## Reconciliation table (22 input rows → HEAD `53ac680`)

| # | Pattern (type) | Instance | Evidence / source location (HEAD) | Classification | Part 3? |
|---|---|---|---|---|---|
| 1 | Strategy | Logging Output Strategy | `LogBackend.ts:12-24`; `LogManager.ts` `setBackend` 255, `backend.write` 367 | CONFIRMED | Yes |
| 2 | Adapter | Telemetry Backend Adapter Layer | `TelemetryAdapter.ts:27`; `SentryTelemetryAdapter.ts:71` | CONFIRMED | Yes |
| 3 | Repository | Persistence Repository Layer | `models/_.ts:89-97, 184, 229`; `RepositoryModule.ts:91-95` | CONFIRMED (framework idiom) | Yes |
| 4 | Publish-Subscribe | Global Redis Event Publication | `GlobalEventService.ts:341-357`; `StreamingApiServerService.ts:27-28,104` | CONFIRMED | Yes |
| 5 | Job Queue | Federation Delivery Job Queue | `QueueService.ts:166,210`; `DeliverProcessorService.ts:53` | CONFIRMED | Yes |
| 6 | Cache-Aside | Federated Instance Cache-Aside | `FederatedInstanceService.ts:49-60` | CONFIRMED | Yes |
| 7 | Two-Level Cache | RedisSingleCache L1/L2 | `misc/cache.ts:113-175` | CONFIRMED | Yes |
| 8 | Front Controller | Misskey API Front Controller | `ApiServerService.ts:65`; `ApiCallService.ts:498` | CONFIRMED | Yes |
| 9 | Factory | Logging Backend Factory | `logging-runtime.ts:21-27` | CONFIRMED (simple factory function) | Yes |
| 10 | Object Pool | Shared Streaming Connection Pool | `misskey-js/streaming.ts:50,111-128,233-298` | UNCERTAIN (ref-counted sharing, not a reusable-object pool) | No, held separate |
| 11 | Observer | Frontend Global Event Observer | `events.ts:22`; `MkDrive.vue:184,369,391` | CONFIRMED | Yes |
| 12 | Observer | Note-Specific Reactive Event Observer | `composables/use-note-capture.ts:25,87,108,112` | CONFIRMED | Yes |
| 13 | Observer | Theme Manager Observer | `theme.ts:29` (`extends EventEmitter`) | CONFIRMED | Yes |
| 14 | Observer | Deck Column Drag Observer | `deck.ts:23`; `ui/deck/column.vue:49,81,90` | CONFIRMED (CSV path `components/deck/column.vue` is wrong; real path is `ui/deck/column.vue`) | Yes |
| 15 | Mediator | Streaming Connection Coordination | `misskey-js/streaming.ts:47-148,233-368` | UNCERTAIN (more Facade/coordinator) | No, held separate |
| 16 | Router | Nirax Frontend Router | `lib/nirax.ts:257,411` | CONFIRMED | Yes |
| 17 | Observer | PreferencesManager Observer | `preferences/manager.ts:194,267`; `preferences.ts:116` | CONFIRMED | Yes |
| 18 | Factory | Streaming Connection Factory | `misskey-js/streaming.ts:107-125,313-399` | UNCERTAIN (creation is in `Stream` methods, no dedicated factory) | No, held separate |
| 19 | Service Layer | Core Application Service Layer | `AnnouncementService.ts:10-221`; `admin/announcements/create.ts:72,75` | CONFIRMED | Yes |
| 20 | Plugin Architecture | Frontend Plugin Architecture | `plugin.ts:136,229,238,313` | CONFIRMED | Yes |
| 21 | Template Method | Chart Processing Framework | `chart/core.ts:177,196,201,583-584` | CONFIRMED | Yes |
| 22 | Proxy | AnalyticsProxy | `frontend/src/analytics.ts:12-78` | CONFIRMED | Yes |

Rows 11-14 are confirmed from the audit's earlier source reads, plus the spot checks above (`use-note-capture.ts` line numbers, `column.vue` at its real path, `deckGlobalEvents`, `MkDrive` emit calls). Row 3 is weak as a domain Repository, but the structure exists.

## Counts

| Measure | Number |
|---|---|
| Input rows (instances) | **22** |
| Distinct input pattern types | **17** |
| Confirmed instances | **19** |
| Confirmed pattern types | **15** (Factory counted once, since it has one confirmed and one uncertain instance) |
| Uncertain instances | **3** (rows 10, 15, 18) |
| Uncertain-only types | **2** (Object Pool, Mediator) |
| Invalid / excluded as wrong | **0** |
| Additional candidates (not in input, kept separate) | **3** (Streaming Channel Strategy, ModuleRef Factory, RedisKVCache) |

### Why the earlier 15 was lower
The 15 was types, not instances. Observer has 5 confirmed instances (rows 11, 12, 13, 14, 17) and I had put only one of them in the list. The 3 uncertain rows are the only deliberate exclusions, and I haven't dropped any silently.

## Decision: types or instances?
The report template says "for each confirmed pattern type, choose one representative verified instance". Your requirement to compare every input row suggests covering all confirmed instances. Two reasonable options:

| Option | Selection | Implementations |
|---|---|---|
| **A (template-literal)** | 15 types × 1 representative instance (Observer = PreferencesManager) | 15 × 4 = **60** |
| **B (all confirmed instances)** | 19 confirmed instances | 19 × 4 = **76** |

### Recommendation
Choose **A**. The template asks for one representative per type, and the four extra Observer rows share the same pattern structure. They would add 16 snippets that mostly duplicate the same code in four languages. I'd document the four unselected Observer instances in the report's selection-reason text so the reconciliation stays auditable.

Choose **B** only if your instructor expects every instance.

## For approval
- The 15 confirmed types listed above, with option A or B for the implementation count.
- The 3 uncertain rows (10, 15, 18) stay out and are listed separately in the report.
- The 3 additional candidates stay out.
- The access tier for the LLM record is still needed.

No implementation or file changes have been made. Which option, A (60) or B (76)?

===== assistant message (2026-10-10T11:25:40.522Z) =====
## HEAD confirmation
`git rev-parse HEAD` returns `53ac6808ae4921305e761c545863ee6593edd1f4`, and the working tree is clean. I rechecked all 15 patterns against this commit. The code index metadata for the cited files matches it. No original CSV was touched.

## Per-pattern verification

**1. Strategy: Logging Output Strategy**
- **Behavior:** `LogManager` holds a `LogBackend` and delegates `write`, `writeAccess`, `flush` and `close` to it (`LogManager.ts:294,296,367,412`). `setBackend` swaps it at runtime (255-256). Pretty, Json and Bootstrap backends implement the interface.
- **Why it fits:** an interchangeable algorithm family, with the context holding only the interface.
- **Ambiguity:** none. **Status: confirmed.**

**2. Factory: Logging Backend Factory**
- **Behavior:** `createLoggingBackend(format)` (`logging-runtime.ts:21-25`) returns a `PrettyConsoleBackend` or `JsonConsoleBackend` by format and throws on any other value. `configureLogging` (30-32) installs the result via `setBackend`.
- **Ambiguity:** it is a module-private simple factory function. It is not GoF Factory Method or Abstract Factory, and it shares the Strategy evidence.
- **Status: confirmed with caveat.**

**3. Adapter: Telemetry Backend Adapter**
- **Behavior:** the app-owned interface `TelemetryAdapter` (`TelemetryAdapter.ts:27-48`) is implemented by `SentryTelemetryAdapter` (`SentryTelemetryAdapter.ts:71-112`). The adapter wraps the Sentry API (`captureMessage`, `getActiveSpan`, `startSpan`, `close`). The registry holds `TelemetryAdapter[]` and calls only the interface (`telemetry-registry.ts:16-41`).
- **Ambiguity:** there is only one concrete adapter, and the interface looks designed around Sentry.
- **Status: confirmed with caveat.**

**4. Template Method: Chart Processing Framework**
- **Behavior:** `Chart.tick()` (`core.ts:583-584`) fixes the algorithm and calls the abstract hooks `tickMajor`/`tickMinor` (196, 201). Concrete charts override them, for example `active-users.ts:41,45`.
- **Check:** 16 chart files extend `Chart<`.
- **Status: confirmed.**

**5. Proxy: AnalyticsProxy**
- **Behavior:** `AnalyticsProxy implements AnalyticsInstance` (`analytics.ts:12-78`) and forwards every method to the optional real instance. The exported `analytics` proxy (line 80) is created before the lazily imported library is set via `setAnalytics`.
- **Why it fits:** same interface, controlled access, deferred real subject (a virtual proxy).
- **Ambiguity:** it also behaves as a Null Object, since it returns no-ops when absent. The stated intent still favours Proxy.
- **Status: confirmed.**

**6. Observer: PreferencesManager**
- **Behavior:** `PreferencesManager extends EventEmitter<…>` (`manager.ts:194`) and emits `committed` (267). `preferences.ts:116` registers `prefer.on('committed', …)` and broadcasts to other tabs.
- **Ambiguity:** the Subject/Observer mechanics come from the EventEmitter3 library, a framework idiom. The collaboration is Misskey's.
- **Status: confirmed.**

**7. Two-Level Cache: RedisSingleCache**
- **Behavior:** `get()` checks `memoryCache`, then `redisClient.get`, and populates memory from Redis. `fetch()` falls back to `fetcher` and writes both levels via `set` (`cache.ts:113-205`).
- **Status: confirmed.**

**8. Cache-Aside: Federated Instance Cache-Aside**
- **Behavior:** `fetchOrRegister` (`FederatedInstanceService.ts:50`) calls `federatedInstanceCache.get` (53), reads `instancesRepository.findOneBy` on a miss (56), inserts if missing (59), then explicitly calls `cache.set` (65, 68). A second method (77-86) caches a null result. `update` (102) refreshes the cache.
- **Ambiguity:** the cache is a `RedisKVCache` (line 30), which is itself two-level. The application code owns the lookup and population, which is the Cache-Aside part.
- **Status: confirmed with caveat** (overlaps #7 infrastructure).

**9. Publish-Subscribe: Global Event Publication**
- **Behavior:** `GlobalEventService.publish` sends JSON through `redisForPub.publish(config.host, …)` (`GlobalEventService.ts:341-357`). `StreamingApiServerService` subscribes via `redisForSub.on('message')` (104) and forwards to per-connection emitters (`ev.emit(data.channel, …)`, 118-122).
- **Why it fits:** publisher and subscriber are decoupled by a broker.
- **Ambiguity:** one Redis channel is keyed by host, and topic routing happens in-process.
- **Status: confirmed.**

**10. Job Queue: Federation Delivery Queue**
- **Behavior:** the producer is `QueueService.deliverQueue.add` (`QueueService.ts:166`) with `addBulk` at 210. The consumer is `Bull.Worker(QUEUE.DELIVER…)` (`QueueProcessorService.ts:265-269`), which calls `DeliverProcessorService.process(job)` (`DeliverProcessorService.ts:53`).
- **Ambiguity:** BullMQ provides the queue mechanics. Misskey supplies the producer and consumer.
- **Status: confirmed.**

**11. Front Controller: API Front Controller**
- **Behavior:** `ApiServerService` registers every endpoint (`:65`) and routes them all to `ApiCallService.handleRequest`/`handleMultipartRequest` (`ApiCallService.ts:194,233`). That handler authenticates (212), rate-limits (387-391), then dispatches `ep.exec` (498).
- **Ambiguity:** Fastify registers one route per endpoint, not one literal dispatch route. The centralized handler does the pre-processing.
- **Status: confirmed with caveat.**

**12. Router: Nirax Frontend Router**
- **Behavior:** `Nirax extends EventEmitter` (`nirax.ts:218`). `resolve` maps a path to a route (257), and `navigate` updates current state and emits `change` (411-425). It handles `loginRequired`.
- **Ambiguity:** Router is an architectural/UI pattern, not GoF.
- **Status: confirmed.**

**13. Service Layer: AnnouncementService**
- **Behavior:** `AnnouncementService` (`AnnouncementService.ts:10-221`) coordinates repositories, `IdService`, `GlobalEventService` and `ModerationLogService` per use case (`create` 69, `update` 121, `delete` 160, `read` 202). Endpoint classes delegate to it (`admin/announcements/create.ts:72,75`).
- **Ambiguity:** "Service Layer" is a broad label here. The use-case boundary and delegation are real, but the evidence is by convention across about 76 services, and I verified one in depth.
- **Status: confirmed with caveat.**

**14. Plugin Architecture: Frontend Plugin Architecture**
- **Behavior:** `installPlugin` (`plugin.ts:136`), a handler registry `pluginHandlers` (227) with `addPluginHandler` (229-236), and `getPluginHandlers` (462-463). Plugins register handlers such as `note_action` and `post_form_action` (381-427). `abortPlugin` (313-320) removes them.
- **Ambiguity:** none material. The host application consumes the handler lists elsewhere.
- **Status: confirmed.**

**15. Repository: Persistence Repository Layer**
- **Behavior:** `MiRepository<T>` and `miRepository.insertOne` (`models/_.ts:89-97`). Repository types combine `Repository<T> & MiRepository<T>` (184, 229). `RepositoryModule.ts:91-95` provides them via `db.getRepository(...).extend(miRepository)`. Services inject the repository types.
- **Ambiguity:** the collection-like abstraction comes from TypeORM. Misskey adds the DI layer and one extension method, with no domain-specific repository interface.
- **Status: confirmed with caveat** (framework idiom).

## Summary

| # | Pattern | Verified locations (HEAD) | Status |
|---|---|---|---|
| 1 | Strategy | `LogBackend.ts:12-24`; `LogManager.ts:255,294,367,412` | confirmed |
| 2 | Factory | `logging-runtime.ts:21-32` | confirmed with caveat |
| 3 | Adapter | `TelemetryAdapter.ts:27-48`; `SentryTelemetryAdapter.ts:71-112`; `telemetry-registry.ts:16-41` | confirmed with caveat |
| 4 | Template Method | `chart/core.ts:196,201,583-584` | confirmed |
| 5 | Proxy | `frontend/src/analytics.ts:12-80` | confirmed |
| 6 | Observer | `preferences/manager.ts:194,267`; `preferences.ts:116` | confirmed |
| 7 | Two-Level Cache | `misc/cache.ts:113-205` | confirmed |
| 8 | Cache-Aside | `FederatedInstanceService.ts:30,50-102` | confirmed with caveat |
| 9 | Publish-Subscribe | `GlobalEventService.ts:341-357`; `StreamingApiServerService.ts:104,118-122` | confirmed |
| 10 | Job Queue | `QueueService.ts:166,210`; `QueueProcessorService.ts:265-269`; `DeliverProcessorService.ts:53` | confirmed |
| 11 | Front Controller | `ApiServerService.ts:65`; `ApiCallService.ts:194,212,233,387-391,498` | confirmed with caveat |
| 12 | Router | `lib/nirax.ts:218,257,411-425` | confirmed |
| 13 | Service Layer | `AnnouncementService.ts:10-221`; `admin/announcements/create.ts:72,75` | confirmed with caveat |
| 14 | Plugin Architecture | `plugin.ts:136,227-236,313-320,381-427,462-463` | confirmed |
| 15 | Repository | `models/_.ts:89-97,184,229`; `RepositoryModule.ts:91-95` | confirmed with caveat |

**Result:** 15 of 15 passed verification. 9 are confirmed and 6 are confirmed with caveat. None are uncertain, and no replacements are needed.

## Open items before implementation
- Approve option A (15 types × 1 instance = 60 implementations) or option B (19 confirmed instances = 76).
- Tell me the access tier for the LLM record.
- Caveated patterns will carry their caveat in `language_notes` and the per-language READMEs.

I haven't started implementation.
