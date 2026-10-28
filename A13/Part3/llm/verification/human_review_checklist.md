# Part 3 verification record

Verification of the Part 3 source classifications, implementations, measurements and LLM records, performed with AI assistance (Claude Sonnet 5.5) on 2026-10-10 and 2026-10-11. Evidence files are in `Part3/evidence/`; the 2026-10-11 session's prompts and assistant text are in `Part3/llm/verification_session_prompts.txt` and `Part3/llm/outputs/verification_session_output.md` (row 5 of `data/llm.csv`).

The per-pattern assessments in section 2 were made on 2026-10-10 and every cited range was re-read at HEAD on 2026-10-11; the headings carry the assessment that stands after that second reading.

## 0. What was checked, and how

| item | how | direct or from logs |
|---|---|---|
| Misskey HEAD is `53ac6808ae4921305e761c545863ee6593edd1f4`, tree clean | `git rev-parse HEAD`, `git status --short` | direct |
| the 15 source classifications (section 2) | the cited files were re-read at HEAD with line numbers in this review, from the source and not from the READMEs | direct |
| prompts in `part3_prompt.txt` are the submitted ones | each of the 9 prompts was found verbatim in the session transcript (checked again 2026-10-11) | direct |
| model name | every assistant message in the transcript carries `claude-sonnet-5-5` | direct |
| access tier | the transcript has no field for it | **missing** |
| all 60 snippets pass | the 15 patterns were re-run in this review through a throw-away script (compile and run, no timing), all 60 printed `passed N/N`; the stored logs were also read. Re-run again 2026-10-11 from the first code block of every README in a scratch copy: 60 of 60 exit 0, `passed N/N`, 0 warning lines | direct (re-run) and logs |
| same cases in all four languages | each test file reads the fixture path from its command line (no test embeds expected values); every log's command points to the same `test-cases/<pattern>.txt`; passed counts equal the fixture's case count | direct from files and logs |
| recorded medians | recomputed from `evidence/timing/raw_timing.csv`: all 60 match the CSV, 5 runs each, all exit codes 0 | direct |
| runtime/compiler versions | the version commands were run again and match `data/cross_language.csv` (OpenJDK 17.0.19, CPython 3.14.6, Node v24.15.0, g++ 16.1.1) | direct |
| LOC | recomputed with an independent counter (blank and comment lines removed): Java and JavaScript match lizard on all 30; Python differs on 2 files because lizard also leaves out docstrings; C++ differs by exactly 1 line on all 15 files, the `#pragma once` line (lizard counts `#include` but not `#pragma once`/`#define`; re-checked 2026-10-11 with a 4-line sample). On 2026-10-11 lizard 1.24.1 was installed in a throw-away venv and all 60 `source_loc` and `max_function_cc` values were reproduced | direct (re-run) |
| max cyclomatic complexity | lizard re-run 2026-10-11: all 60 values equal the CSV. Python re-measured with radon 6.0.1: 14 of 15 match at function level, Router is 11 in radon and 10 in lizard (radon counts the `for ... else`). Java, JavaScript and C++ have one tool only (lizard) | direct for lizard; single tool for Java, JavaScript, C++ |
| warm-up run before the five timed runs | `run_measurements.py:130` does it (`sh(run, cwd=d, shell=True)  # warm-up run, not recorded`), but the warm-up time is not stored anywhere. `raw_timing.csv` has 300 `measured` rows and no warm-up row, and each log's `# timing: 1 warm-up + 5 runs, ms:` line lists only five values. The harness was not re-run (that would overwrite the evidence) | **cannot confirm from output; confirmed from script only** |
| the original (pre-fix) generated code | exists in the session transcript only; `outputs/implementation_phase_output.md` holds the final generator scripts | partly missing |

The first-version generated files were later edited (seven corrections, listed in `implementation_verification.md`). The transcript is not part of the submission folder.

## 1. LLM records (rows of `data/llm.csv`)

| row | activity | prompt | input | raw output | evidence available | gap |
|---|---|---|---|---|---|---|
| 1 | scope selection and source verification | prompts 1-5 in `part3_prompt.txt` | `inputs/part3_inputs.md` (hashes of files read) | `outputs/selection_phase_output.md` | all present | tool results (grep, sed output) are only in the transcript |
| 2 | writing the 60 snippets, tests, fixtures, READMEs | prompt 6 | same | `outputs/implementation_phase_output.md` | present (final scripts) | first versions of the code; the transcript has them |
| 3 | measurement harness (`run_measurements.py`) | prompt 6 | `Part3/code/` | `evidence/run_measurements.py` | present | none for the script; its warm-up is not evidenced in output |
| 5 | AI-assisted verification and corrections of 2026-10-11 | prompts V1-V2 in `verification_session_prompts.txt` (a separate file; not part of `part3_prompt.txt`) | `llm/verification/human_review_checklist.md` (state before the session; the session also read `Part3/code/`, `Part3/test-cases/`, the evidence folder and the Misskey source) | `outputs/verification_session_output.md` (assistant text only) | present as extracts | the file edits and tool output of the session are not stored; the complete transcript is not included |

Model and date for rows 1-4: Claude Sonnet 5.5 (`claude-sonnet-5-5`, the only model id on any assistant message in the transcript) (session ID not included). Transcript timestamps run from 2026-10-10 10:07 to 13:21 UTC (15:37 to 18:51 local, +05:30), so the date is 2026-10-10 in both UTC and local time. The access tier is not in the transcript and was not supplied, so it is not recorded; it is not part of the CSV columns. Row 5 is from a separate session (model `claude-sonnet-5-5`, 2026-10-11, transcript timestamps 05:37 to 05:56 UTC for the extracted turns).

## 2. The 15 pattern classifications (source checked directly)

Paths are under `misskey/packages/`. "Claim" is what the model (README and `cross_language.csv`) said. The assessment uses the four assignment labels.

### 1. Strategy: Logging Output Strategy: **correct**
- **Source:** `backend/src/logging/LogBackend.ts:12-24`; `LogManager.ts:220-257` (field 221, `setBackend` 255-256), `LogManager.ts:367` (`this.backend.write(record)`); implementers at `BootstrapConsoleBackend.ts:22`, `JsonConsoleBackend.ts:104`, `PrettyConsoleBackend.ts:37`.
- **Observed:** the manager holds one `LogBackend`, calls `write` on it, and `setBackend` replaces it at runtime. Three classes implement the interface.
- **Why it supports Strategy:** an interchangeable family behind one interface, chosen and swapped by the context.
- **Caveat:** the manager also builds the normalized record (lines ~340-365), so the README sentence "never formats anything" is slightly strong; it formats the record, not the output line. The model's "null backend is rejected" is not in the source.

### 2. Factory: Logging Backend Factory: **partial**
- **Source:** `backend/src/logging/logging-runtime.ts:21-25` (`createLoggingBackend`, not exported; the comment is at 20), caller `configureLogging` at 28-32 (line 30); `configureLogging` is called from `boot/master.ts:159` and `boot/worker.ts:26`. No other caller of `createLoggingBackend`.
- **Observed:** a private function returns a Pretty or Json backend from a string and throws on anything else.
- **Support:** yes for a simple factory. It is not Factory Method or Abstract Factory, and it is one function with one caller.
- **Caveat:** the classification holds only under the loose "simple factory" meaning.

### 3. Adapter: Telemetry Backend Adapter: **correct**
- **Source:** `backend/src/core/telemetry/adapters/TelemetryAdapter.ts:27-48`; `SentryTelemetryAdapter.ts:71-112` (`captureMessage` 86-92, `startSpan` 103-105, `shutdown` 107-110, constant at 12); registry `telemetry-registry.ts:16-52`; callers `core/telemetry/TelemetryService.ts:15` (the file is under `core/telemetry/`, not `core/`), `ApiCallService.ts:169,212`.
- **Observed:** the app's interface is implemented by a class that converts `{level, userId, extra}` to Sentry's `{level, user:{id}, extra}`, wraps `startSpan`, and calls `Sentry.close(5000)`.
- **Support:** an app-defined target interface adapting a third-party SDK with a different call shape.
- **Caveat:** only one adapter exists, and the interface was written around Sentry's features, so the benefit is partly prospective.

### 4. Template Method: Chart Processing Framework: **correct**
- **Source:** `backend/src/core/chart/core.ts:177` (abstract class), `196`, `201` (abstract hooks), `583-616` (`tick`); subclasses e.g. `charts/instance.ts:51,75`; 16 files under `charts/` extend `Chart<`; callers `queue/processors/TickChartsProcessorService.ts:52-54`.
- **Observed:** `tick` fixes the sequence (pick hook, prefix and clamp columns, skip if empty, update hour and day rows) and calls `tickMajor`/`tickMinor`, which subclasses supply.
- **Support:** this is the Template Method structure.
- **Caveat:** several subclasses (e.g. `active-users.ts:41,45`) have hooks that return `{}`, so they use the template mainly through other methods. The instance is still valid.

### 5. Proxy: AnalyticsProxy: **correct**
- **Source:** `frontend/src/analytics.ts:12-78`, `setAnalytics` 21-26, instance 80, `initAnalytics` 82-108 (returns early without loading the library when there is no analytics ID).
- **Observed:** a class implementing `AnalyticsInstance` forwards each call to a real instance that is set later, and returns a default when it is not set.
- **Support:** same interface, controlled access, deferred real subject (virtual proxy).
- **Caveat:** it also behaves like a Null Object when analytics is never initialised.

### 6. Observer: PreferencesManager: **correct** (classification); the model's `oldValue` was **corrected** in prompt 8
- **Source:** `frontend/src/preferences/manager.ts:105-111` (event type), `194` (extends `EventEmitter`), `203` (`s` is a plain object), `244-247` (`rewriteRawState` sets `this.s[key]`), `250-272` (`commit`: unchanged check 254-257, `rewriteRawState` at 261, `emit('committed', {key, value: v, oldValue: this.s[key]})` at 267-271); observer `frontend/src/preferences.ts:116-126`.
- **Observed:** `commit` emits `committed`; `preferences.ts` subscribes once and notifies other tabs. Because the state is updated before the emit reads `this.s[key]`, the emitted `oldValue` equals the new value. Unchanged values are not announced. **Executed 2026-10-11:** the verbatim lines 244-248 and 250-299 were run in a stub class; output `oldValue` = new value, the repeated commit emitted nothing. This is not Misskey's frontend or its test suite.
- **Support:** subject with subscribers it does not know.
- **Caveat:** the mechanism is the EventEmitter library; there is no declared observer class. The `oldValue` behaviour is reproduced as observed and is not claimed to be intended.

### 7. Two-Level Cache: RedisSingleCache: **correct**
- **Source:** `backend/src/misc/cache.ts:113-136` (fields and constructor, `memoryCacheLifetime` and `fetcher`), `138-153` (`set` writes memory and Redis), `155-169` (`get`: memory then Redis, copies into memory), `185-196` (`fetch`), `MemorySingleCache` 340-369; used by `CustomEmojiService.ts:78`.
- **Observed:** exactly a memory level in front of Redis, with a fetcher on a miss.
- **Caveat:** none material; Redis TTL (`EX`) exists but is not modelled.

### 8. Cache-Aside: Federated Instance Cache-Aside: **correct, with a caveat** (ruled on 2026-10-11: the service itself calls `get`, queries the repository on a miss and calls `set`, `FederatedInstanceService.ts:53-71`)
- **Source:** `backend/src/core/FederatedInstanceService.ts:30-33` (cache with a `fetcher`), `50-71` (`fetchOrRegister`), `73-89` (`fetch`, caches null), `92-103` (`update` refreshes cache), `107` (`dispose`).
- **Observed:** the service calls `cache.get`, goes to the repository on a miss, and calls `cache.set` itself. It never calls `cache.fetch`.
- **Support:** application code owns lookup and population, which is Cache-Aside.
- **Caveat:** the cache object is a `RedisKVCache` created with a fetcher, i.e. capable of read-through, and it is itself two-level (pattern 7's family). The same class therefore serves two classifications.

### 9. Publish-Subscribe: Global Event Publication: **correct**
- **Source:** `backend/src/core/GlobalEventService.ts:351-361` (`publish` -> `redisForPub.publish`), `369-376` (`publishBroadcastStream`, `publishMainStream` with `mainStream:<id>`); `backend/src/GlobalModule.ts:78` (`redis.subscribe(config.host)`); `server/api/StreamingApiServerService.ts:104-107` (subscriber), `116-122` (per-connection emitter).
- **Observed:** publishers write JSON to one Redis channel; the streaming server subscribes and fans out to WebSocket connections by logical channel name.
- **Support:** publisher and subscribers are decoupled by a broker.
- **Caveat:** Redis uses one channel per host; the topic (`mainStream:<id>`) is a field inside the message, filtered in-process. The model merges both steps.

### 10. Job Queue: Federation Delivery Queue: **correct**
- **Source:** `backend/src/core/QueueService.ts:146-171` (`deliver`; label at 164, `add` at 166, attempts default 12 at 167, custom backoff 168-170), `210` (`addBulk`); `queue/QueueProcessorService.ts:265-289` (worker, `process` called at 269); `queue/processors/DeliverProcessorService.ts:53-72` (`process`, `skip (blocked)` 56-58, `skip (suspended)` 71).
- **Observed:** producer enqueues a job and returns; a separate worker takes it and runs the processor; retries and backoff are configured.
- **Support:** this is an asynchronous work queue.
- **Caveat:** BullMQ does the queueing; the model re-implements a queue to be runnable. Backoff, concurrency (128) and rate limiting are not modelled.

### 11. Front Controller: API Front Controller: **partial**
- **Source:** `backend/src/server/api/ApiServerService.ts:65-106` (loop registering one Fastify route per endpoint; each route first rejects GET on non-`allowGet` endpoints with 405 and then calls `apiCallService.handleRequest` (102) or `handleMultipartRequest` (86)); `ApiCallService.ts:194-230` (`handleRequest`, authenticate at 212), `368-400` (rate limit only `if (ep.meta.limit)`, key defaults to the endpoint name, 429 on excess), `498` (`ep.exec`).
- **Observed:** all API calls share one handler that authenticates, rate-limits and dispatches. But routing is done by Fastify with one registered route per endpoint, not by a single entry point.
- **Support:** the centralized pre-processing (token, authentication, rate limit, validation, dispatch) matches a Front Controller; the single-entry part is only loosely true. Assessment unchanged on re-reading 2026-10-11: **partial**.
- **Caveat:** the model's rate limit (2 calls per actor, global) is its own simplification.

### 12. Router: Nirax: **correct** (as a UI/architectural pattern)
- **Source:** `frontend/src/lib/nirax.ts:218` (class extends `EventEmitter`), `257` (`resolve`), `411-433` (`navigate`: login-required handling 415-418, `emit('change')` 424-430); catch-all route `frontend/src/router.definition.ts:607`.
- **Observed:** a path is matched to a route with parameters, current state is replaced, and a change event is emitted; the catch-all `/:(*)` suppresses the event.
- **Caveat:** Router is not a GoF pattern; whether the rubric accepts it depends on the course's pattern categories.

### 13. Service Layer: AnnouncementService: **partial**
- **Source:** `backend/src/core/AnnouncementService.ts:10-31` (injected collaborators), `45-66` (unread query), `69-118` (`create`: insert, publish, moderation log), `202-224` (`read`); caller `server/api/endpoints/admin/announcements/create.ts:72-75`.
- **Observed:** one service coordinates repositories, events and moderation logging for each use case, and an endpoint delegates to it.
- **Support:** this one service is a fair example of an application service layer. Breadth check 2026-10-11 (a count, not a reading): 54 of the 76 `backend/src/core/*Service.ts` files inject at least one `DI.*Repository` token. That shows the shape is common, not that the layer was verified. Assessment: **partial**.
- **Caveat:** the instance is named for the whole "Core Application Service Layer"; only one service was read in this review (and `CoreModule.ts` only through the earlier audit). Layer-wide evidence is not confirmed. The model's `unread` also omits the `silence` and `forExistingUsers` conditions (51-60).

### 14. Plugin Architecture: Frontend Plugin Architecture: **correct**
- **Source:** `frontend/src/plugin.ts:136` (`installPlugin`), `227-236` (registry and `addPluginHandler`), `296-311` (failed exec logs and rethrows, handlers stay), `313-320` (`abortPlugin` removes handlers), `378-427` (handler registrations), `462-463` (`getPluginHandlers`); consumers `composables/use-note.ts:111`, `components/MkPostForm.vue:228,1052`, `pages/page.vue:153`.
- **Observed:** plugins register handlers for named extension points; the host applies them where it needs them and drops them on abort.
- **Support:** host plus extension-point registry plus real consumers.
- **Caveat:** plugins are sandboxed AiScript programs; "microkernel" is used loosely.

### 15. Repository: Persistence Repository Layer: **partial**
- **Source:** `backend/src/models/_.ts:89-97` (`MiRepository`, `miRepository.insertOne`), `184`, `229` (typed repositories); `models/RepositoryModule.ts:91-95` (`db.getRepository(MiUser).extend(miRepository)`); client `core/UserService.ts:15-23` (injects `UsersRepository`).
- **Observed:** services depend on injected repository objects and never on the data source; Misskey adds one method on top of TypeORM's repository.
- **Support:** the collaboration (client, repository abstraction, DI wiring) exists.
- **Caveat:** the abstraction is TypeORM's. Misskey contributes DI tokens and `insertOne`, and defines no repository interface of its own. The snippets model it with an in-memory store, not TypeORM.

### Summary of assessments
correct: 1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14 (11 patterns). partial: 2, 11, 13, 15 (4 patterns). The team decided to keep all 15, including the four partial ones, as confirmed with caveats. incorrect: none. cannot confirm: none.

## 3. Other claims to check

| claim | assessment | evidence | gap or note |
|---|---|---|---|
| all 60 pass, 97 cases (388 executions) | correct | logs from the full harness run after the Observer change, plus a direct re-run of the earlier version in the first review | none |
| four languages equivalent | correct for the tested cases | one fixture per pattern, same command lines | equality is only on 96 cases; the models drop framework behaviour and add rules of their own (README "Not modelled") |
| LOC measured consistently | correct | lizard NLOC for all 60; independent recount agrees apart from explained differences | C++ counts closing braces and includes; not comparable across languages as "size of idea" |
| max CC measured consistently | correct for lizard; single tool for three languages | lizard re-run on all 60 on 2026-10-11 (all equal); radon agrees on 14 of 15 Python files | one tool for Java, JS and C++; JS needed the `get`/`set`/`delete` workaround (documented) |
| timing procedure | partly confirmed | 5 runs per snippet are stored; all 60 medians recomputed 2026-10-11 and match | warm-up not stored; it is in the script only |
| versions and medians match | correct | commands re-run, medians recomputed | none |
| model's rules not from Misskey are labelled | correct | READMEs and `implementation_verification.md` | two more were found in review (Observer `oldValue` semantics, per-endpoint rate limit); the Observer snippets now follow the source and the rate-limit difference is in the Front Controller README |

## 4. Corrections made

First review (prompt 7):
- Observer README, Cache-Aside README (second method is `fetch`, 73-89; the cache has a fetcher), Publish-Subscribe README (`GlobalModule.ts:78`), Front Controller README (the real rate limit is per endpoint and optional), Template Method README (a chart with non-trivial hooks, callers of `tick`), and `implementation_verification.md` item 5 (wrong statement about lizard and docstrings).

Decisions round (prompt 8):
- **Observer code and fixture changed** to reproduce the source (new value in `oldValue`, unchanged commits not announced). Four snippets, `test-cases/observer.txt` and the Observer README were updated; tests rerun (8/8 for all four languages); the whole measurement harness was rerun, so every log, raw timing, lizard row and `data/cross_language.csv` row comes from one run. The Observer row values changed (LOC, complexity, timing); other rows differ only in timing noise.
- **Status lines** added at the top of the six caveated pattern READMEs (Factory, Adapter, Cache-Aside, Front Controller, Service Layer, Repository), and the Service Layer README now says plainly that only one service was read in detail.
- **Cache-Aside and Two-Level Cache** READMEs now explain the difference (application logic versus cache infrastructure), and so does `Part3/README.md`.
- **Lizard/docstring note** corrected in `implementation_verification.md` (item 5), as above.
- `part3_prompt.txt` now holds prompts 1-9 (prompt 9, finishing the records, has no extracted output); `outputs/review_phase_output.md` and a fourth `data/llm.csv` row cover prompts 7-8.

## 5. Decisions

Project decisions:
1. Scope stays 15 types and 60 implementations.
2. Factory, Front Controller, Service Layer and Repository stay as confirmed with caveats, with the limitations written out (Adapter and Cache-Aside keep their caveats too).
3. Cache-Aside and Two-Level Cache stay separate, with the difference explained.
4. Observer: reproduce the source's `oldValue` behaviour (done).
5. Router, Service Layer and Plugin Architecture stay. The assignment supports this: the report template (section 2.3) lists the pattern category as "GoF / GRASP / architecture / concurrency / framework idiom", and the assignment PDF says category "Creational, Structural, Behavioral, GRASP, etc.". The assignment does not say how many patterns of each category are expected, so whether a grader accepts a given one is still the instructor's call.


## 6. Verification method
- Team: A13 (members listed in section 10)
- Verification performed by: Claude Sonnet 5.5 (`claude-sonnet-5-5`), AI-assisted; the review entries were completed by Sreehari M with ChatGPT
- Verification date: 2026-10-11 (all checks in sections 0-3 marked "2026-10-11" were run on that date)
- Rows evaluated: rows 1-4 of `data/llm.csv` (labels in section 7)
- Row 5 of `data/llm.csv` records the 2026-10-11 verification session itself (`claude-sonnet-5-5`). Its `evaluation` is `cannot confirm`: its findings were produced and checked by the same model family.
- Rows 6 and 7 record the AI-generated slide deck and Part 3 report (prompts D3 and D5 in `Part3/llm/deliverables_session_prompts.txt`).
- Executed checks (tests, LOC/CC re-measure, median recomputation, Observer lines in a stub class) and read-only checks (source citations, README text) are listed in sections 0 and 2.

## 7. Final evaluation of the four LLM records (applied to `data/llm.csv`)

Each row of `data/llm.csv` is evaluated against one task. Row 3 (the measurement harness) is the evidence-and-measurements task; row 4 is the review task.

| row | task | important claims | evidence checked | label | why |
|---|---|---|---|---|---|
| 1 | Pattern selection and source verification (prompts 1-5) | 22 input rows and 17 types; HEAD `53ac680`; 15 types have a verified or weakly verified instance; the 15 source locations hold | row count by script; `git rev-parse`; all 15 cited locations re-read at HEAD on 2026-10-10 and again 2026-10-11 (Factory, Front Controller, Service Layer, Repository, Observer, Adapter, Proxy, Strategy, Template Method, caches, Pub-Sub, Job Queue, Router, Plugin); `streaming.ts` re-read for the 3 uncertain rows | **partial** | counts, commit and locations hold; Factory, Front Controller, Service Layer and Repository were labelled "confirmed" more strongly than the source supports (4 partial, not 6 "caveat"); several early line ranges were approximate |
| 2 | Implementations, tests, fixtures and READMEs (prompt 6) | same behaviour in four languages; patterns follow the cited source; tests pass; READMEs accurate | 60 of 60 executed twice (2026-10-10, 2026-10-11), 97 cases, shared fixtures read from argv, 0 warning lines; all README commands run | **correct** | after the Observer fix and the README clean-up the output matches what was checked; two minor README errors (Python/JS "remove build/") were found and fixed |
| 3 | Measurement harness and evidence (prompt 6) | compile first, one warm-up, five timed runs, median; LOC and CC with one tool; versions recorded | 60 medians recomputed; versions re-run; lizard re-run on all 60 (all equal); radon on 15 Python files (14 agree) | **partial** | numbers reproduce, but the warm-up run cannot be shown from any output file and the log wording ("1 warm-up + 5 runs, ms:" followed by five values) suggests otherwise; CC for Java, JavaScript and C++ has a single tool |
| 4 | Review preparation and corrections (prompts 7-8) | per-pattern assessments; Observer `oldValue` finding; cache description; corrections list | cited ranges re-read; `manager.ts:244-299` read and executed in a stub class; tests and harness results re-checked | **correct** | each assessment is tied to source lines that were re-read and agree; the Observer finding was reproduced by executing the verbatim lines, with stubbed dependencies and not Misskey's frontend |

Assignment definitions used: `correct` = claims supported by evidence; `partial` = mostly correct with errors or evidence gaps; `incorrect` = principal claims materially wrong; `cannot confirm` = evidence insufficient. No row was `incorrect` or `cannot confirm`. Where a claim was `cannot confirm` (the warm-up), it is a gap inside a `partial` row.

## 8. Exact claims and evidence for the four evaluations

Line numbers refer to the files in `Part3/llm/outputs/`. "Holds" means it was checked against the source, a log or a command and it was true. Line numbers were re-checked against the files on 2026-10-11 and corrected where they had drifted (they were 2-4 lines off). The `evaluation` cells in `data/llm.csv` hold the final labels of section 7.

**Verbatim check of the stored outputs**. `selection_phase_output.md` (6 messages), `implementation_phase_output.md` (4) and `review_phase_output.md` (2) were compared message by message with the text blocks in the session transcript: same number, same order, same timestamps. Re-checked on 2026-10-11 against the unedited output files and the transcript: all 6 selection messages are byte-identical; in the implementation file 3 of 4 and in the review file 1 of 2 are byte-identical, and the other message in each is the transcript text followed by an appended `generator script` section taken from the session's tool inputs (the transcript text is an exact prefix of the stored block). `part3_prompt.txt` was compared the same way for all 9 prompts (identical apart from the blank lines around each prompt, which are stripped). Two earlier versions of these files were incomplete (the implementation file lacked the final reply to prompt 6 and the review file lacked the reply to prompt 8). Both were completed by extraction from the transcript on the day, not reconstructed. Only the assistant's text messages are stored; tool calls, tool results and hidden reasoning are not in these files.

### Record 1: scope selection and source verification (prompts 1-5), `selection_phase_output.md`
| claim (line) | check | result |
|---|---|---|
| "The input has 22 rows, not 23." (221) | CSV read by script; `wc -l` is 23 with header | holds |
| "Confirmed instances 19", 15 confirmed types (260-261) | derived from the audit statuses (22 minus 3 uncertain) | holds under the audit's labels |
| "15 of 15 passed verification. 9 are confirmed and 6 are confirmed with caveat." (393) | the 15 source locations were re-read at HEAD and hold; the 9/6 split is the model's own labelling and the review rates 11 correct / 4 partial (Factory, Front Controller, Service Layer, Repository) | locations hold; the split is not supported as stated: use 11/4 |
| uncertain rows: Mediator, Object Pool, Streaming Connection Factory (37, 91-, 262-263) | taken from `audit-results/validation.csv`; `streaming.ts:47-52,105-130,233-250,313-330,347-370` re-read 2026-10-11: `Pool` is a ref-counted shared channel subscription (`users`, `inc`/`dec`), not a pool of reusable objects; `Stream` creates `Pool`/`SharedConnection`/`NonSharedConnection` inside `useSharedConnection`/`useChannel`, not in a dedicated factory; connections reference `Stream` and no colleague-to-colleague routing is visible | the audit's UNCERTAIN holds; the three stay excluded |
| "Repository -> confirmed ... framework idiom"; "Service Layer -> confirmed" (148-165) | Repository holds as an idiom (TypeORM `Repository<T>` + `insertOne` + DI); Service Layer holds for `AnnouncementService` only | partly holds; both are **partial** |
| line ranges in the verification table (e.g. `GlobalEventService.ts:341-357`, `analytics.ts:20-26`) | several were approximate or off by a few lines and were corrected in the READMEs | partly wrong, corrected |
| HEAD `53ac680...` and clean tree (repeated at the start of each later prompt) | `git rev-parse HEAD`, `git status --short` | holds |
Final: **partial.** Counts and commit hold; ranges and confidence were looser than the source supports; the uncertain rows were re-read 2026-10-11 and stay excluded.

### Record 2: the 60 snippets, fixtures and READMEs (prompt 6), `implementation_phase_output.md`
| claim (line) | check | result |
|---|---|---|
| "all 60 pass their tests" (18); "60 of 60 pass, 96 fixture cases, 384 executions, no compiler warnings" (30) | logs; direct re-run in the review; later full harness run | held at the time; now 97 cases / 388 executions after the Observer change |
| "one shared fixture per pattern ... read by all four test runners" (31) | test files read the path from argv; logs show the same fixture path | holds |
| timing "about 3-4 ms C++, 24-57 ms Python, 45-53 ms JavaScript, 76-107 ms Java" (33) | the first-run values were overwritten by later harness runs; current medians are within about 1-2 ms of those ranges | approximately right; exact originals not preserved |
| lizard dropped JS `get`/`set`/`delete` methods (37) | reproduced with a temporary renamed copy (Two-Level Cache JS: 1 vs 3) | holds |
| "docstring became a `#` comment so lizard counts LOC consistently" (43) | lizard excludes docstrings; the reason given was wrong | wrong reason, harmless change, corrected in notes |
| model-only rules are labelled (e.g. null backend, 2-call limit) | READMEs and `implementation_verification.md` | holds |
| (implicit, in the Observer snippets and README) `oldValue` is the previous value | source: unchanged commits skipped, `oldValue` read after the update | **wrong**; snippets, fixture and README corrected in prompt 8 |
Final: **correct** (as it stands after the corrections). Behavioural equivalence and test results hold; the one snippet that contradicted its source (Observer) was corrected and the two README instruction errors were fixed.

### Record 3: measurement harness (prompt 6), `Part3/evidence/run_measurements.py`
| claim | check | result |
|---|---|---|
| builds and runs the documented commands per language and saves a log | 60 logs under `evidence/test-logs/` | holds |
| compile first, one warm-up, five timed runs, median | script read; 5 runs per snippet in `raw_timing.csv`; medians recomputed, all 60 match | holds; the warm-up time is not stored, so only the script shows it |
| LOC and complexity from lizard with one rule | independent line count (explained differences only) and radon on 15 Python files (14 agree, Router 11 vs 10) | holds; one tool for Java, JS, C++ |
| rewrites the CSV rows from the same run | `cross_language.csv`, logs and raw timings checked for consistency after the last run | holds |
| runtime/compiler versions recorded | version commands re-run and match | holds |
Final: **partial.** Medians, versions, LOC and CC reproduce; the warm-up is shown by the script only, and the log line wording overstates what the file records.

### Record 4: review preparation and corrections (prompts 7-8), `review_phase_output.md`
| claim (line) | check | result |
|---|---|---|
| "Observer `oldValue` ... appears to carry the new value. It also skips the emit when the value is unchanged." (51) | `manager.ts:203, 244-247, 254-257, 261, 267-271` read line by line; `s` is a plain object | holds by reading; verbatim lines executed in a stub class on 2026-10-11; Misskey's frontend was not run |
| "re-ran all 60 snippets without timing, and all passed" (17) | transcript shows the command and 15 patterns x 4 languages passing | holds |
| "radon agrees ... 14 of 15" (24) | command output in the transcript; radon 6.0.1 re-run 2026-10-11 at function level: 14 of 15 agree (Router 11 vs 10) | holds |
| "Access tier ... not in the transcript" (34) | transcript searched for tier/plan fields; only the search command itself matched | holds |
| Cache-Aside cache is constructed with a fetcher | `FederatedInstanceService.ts:30-33` | holds |
| "Correct (11) / Partial (4)" (37-41) | judgement tied to the cited line ranges, which were re-read | opinion, supported by the cited source |
| "I did not change any code or fixtures" (56) | true for that turn; code and fixture were changed in the next turn | holds for that turn |
| prompt 8 reply: tests 8/8, medians recompute, logs rechecked | the consistency check was run and its output is in the transcript | holds |
Final: **correct** (reproduced by executing the verbatim `manager.ts` lines with stubs; not executed against Misskey's frontend).


## 9. Corrections applied (2026-10-11)

| file | change |
|---|---|
| `Part3/code/*/python/README.md`, `Part3/code/*/javascript/README.md` (30 files) | removed the line telling users to remove a `build/` folder; those two languages create none |
| `Part3/code/pattern_front_controller/README.md` | citation `ApiServerService.ts:65-102` corrected to `65-106` (the whole registration loop) |
| `Part3/README.md` | LOC rule states that lizard counts `#include` but not `#pragma once`/`#define` in C++ |
| `Part3/llm/verification/implementation_verification.md` | timing row no longer implies `raw_timing.csv` holds the warm-up |

### Compliance checks

| item | result |
|---|---|
| `data/cross_language.csv` | header equals the 11 required columns; 60 rows (15 patterns x 4 languages); no empty cell; every `snippet_path` exists; `test_result` equals the last `passed N/M` of the matching log and the case count of the fixture; medians equal the raw runs |
| `data/llm.csv` | 7 required columns, one header row; each `evaluation` holds a label and a correction |
| Project topic | the application analysed (Misskey, Vue 3 frontend, NestJS backend) agrees with a Vue.js-based social media application. 11 of the 15 instances are in the backend (NestJS) and 4 in the Vue frontend (Proxy, Observer, Router, Plugin Architecture) |
| Radon vs lizard (Router) | cause confirmed in the radon 6.0.1 source: `visit` adds 1 plus `bool(node.orelse)` for `For`/`While`; lizard does not count the loop `else` |

## 10. Human review of the LLM records

Designated reviewer for all seven records: **Sreehari M, AM.SC.U4CSE23156**. Team: AM.SC.U4CSE23156 Sreehari M; AM.SC.U4CSE23148 Rohit Prasanth; AM.SC.U4CSE23157 Sreyas S Sankar; AM.SC.U4CSE23173 Sreevisakh A; AM.SC.U4CSE23168 Vighnesh H.


Status: review entries recorded by Sreehari M (AM.SC.U4CSE23156), dated 11/10/2026. The outcomes were drafted with AI assistance (Claude Sonnet 5.5) on 2026-10-11; Sreehari M reports that he used ChatGPT when completing the entries. The `data/llm.csv` schema has no reviewer column, so reviewer and date are recorded here and in section 5 of `Part3/A13_Part3_Report.pdf`.

Verification already done (not human review): executed tests and recomputations, and AI-assisted source reading (rows 1-4); script comparison of figures with `data/cross_language.csv` (rows 6-7); row 5 was produced and checked by the same model family. Paths below are relative to the team folder unless marked as workspace.

### Review entry 1: scope selection and source verification (`data/llm.csv` row 1)

**Claim to confirm:** The input has 22 rows and 19 confirmed instances in 15 pattern types; the cited Misskey locations hold at commit `53ac6808ae4921305e761c545863ee6593edd1f4`; Factory, Front Controller, Service Layer and Repository are only partly supported.

**Inspect:**
- Output: `Part3/llm/outputs/selection_phase_output.md`; prompts 1-5 in `Part3/llm/part3_prompt.txt`; inputs and file hashes in `Part3/llm/inputs/part3_inputs.md`.
- Source (Misskey checkout, workspace `misskey/packages/`): `backend/src/logging/logging-runtime.ts:21-25`; `backend/src/server/api/ApiServerService.ts:65-106`; `backend/src/server/api/ApiCallService.ts:194-230,368-400,498`; `backend/src/core/AnnouncementService.ts`; `backend/src/models/_.ts:89-97`; `backend/src/models/RepositoryModule.ts:91-95`; the other cited ranges are in section 2 of this file.
- Counts: `audit-results/validation.csv` and `audit-input/patterns.csv` (workspace root, outside this folder). `audit-results/validation.csv` is not included in the submitted repository; if it cannot be obtained from a team member, record it as not inspected and do not infer its contents.
- Verification notes: `Part3/llm/verification/selection_verification.md`; section 2 and section 8 (Record 1) of this file.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `corrected`
- Evidence inspected: `selection_phase_output.md`; `part3_inputs.md`; `selection_verification.md`; source findings in sections 2 and 8. `audit-results/validation.csv` was not available in the submitted repository.
- Notes or discrepancies: Counts, commit and selected source locations are supported. The four caveated classifications and corrected line references are documented; the three uncertain candidates were excluded.

### Review entry 2: the 60 implementations, tests, fixtures and READMEs (`data/llm.csv` row 2)

**Claim to confirm:** All 60 implementations (15 patterns x Java, Python, JavaScript, C++) run the same fixture cases and pass; the Observer snippets follow the cited source.

**Inspect:**
- Implementations: `Part3/code/pattern_<name>/{java,python,javascript,cpp}/` (for example `Part3/code/pattern_factory/`, `Part3/code/pattern_front_controller/`, `Part3/code/pattern_observer/`).
- Tests and fixtures: the test runner in each language folder and `Part3/test-cases/<pattern>.txt`; the run command is in each language README.
- Results: `Part3/evidence/test-logs/<pattern>_<language>.log`.
- Output and notes: `Part3/llm/outputs/implementation_phase_output.md`; `Part3/llm/verification/implementation_verification.md`.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `corrected`
- Evidence inspected: `implementation_phase_output.md`; `implementation_verification.md`; shared fixtures; test logs.
- Notes or discrepancies: The current 60 implementations pass the recorded tests across four languages. The Observer behaviour and README instructions were corrected; equivalence is limited to the shared test cases.

### Review entry 3: measurement harness and evidence (`data/llm.csv` row 3)

**Claim to confirm:** The harness compiles first, runs one warm-up and five timed runs and records the median; LOC and maximum function CC come from lizard 1.24.1; the warm-up time itself is not stored.

**Inspect:**
- Script (the record's output): `Part3/evidence/run_measurements.py` (warm-up at line 130).
- Measurements: `Part3/evidence/timing/raw_timing.csv`, `Part3/evidence/loc-cc/lizard_functions.csv`, `Part3/evidence/environment.txt`, `data/cross_language.csv`.
- Notes: section 0 and section 3 of this file.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `disputed`
- Evidence inspected: `run_measurements.py`; `raw_timing.csv`; `lizard_functions.csv`; `environment.txt`; `cross_language.csv`; sections 0 and 3.
- Notes or discrepancies: Although the recorded medians, software versions, LOC values and lizard complexity measurements reproduce, the evidence does not fully establish the reliability and comparability of the measurements across languages. The warm-up run is executed but its timing is not retained in the raw results, limiting independent verification of the complete measurement process. Additionally, Java, JavaScript and C++ complexity values rely on a single tool, so cross-language comparability is not independently validated. Therefore, the numerical results are reproducible, but the strength of the cross-language measurement claims remains disputed.

### Review entry 4: review preparation and corrections (`data/llm.csv` row 4)

**Claim to confirm:** In `manager.ts` the emitted `oldValue` equals the new value and unchanged commits emit nothing; the cache descriptions and the 11 correct / 4 partial assessments follow the cited source.

**Inspect:**
- Output: `Part3/llm/outputs/review_phase_output.md`; prompts 7-8 in `Part3/llm/part3_prompt.txt`.
- Source (workspace `misskey/packages/frontend/src/`): `preferences/manager.ts:244-299`; `preferences.ts:116-126`.
- Implementations and fixture: `Part3/code/pattern_observer/{java,python,javascript,cpp}/` and `Part3/test-cases/observer.txt`.
- Notes: sections 2, 4 and 8 (Record 4) of this file.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `confirmed`
- Evidence inspected: `review_phase_output.md`; source ranges in `preferences/manager.ts`; Observer snippets, fixture and execution output; sections 2, 4 and 8.
- Notes or discrepancies: The source reading supports the Observer finding and the documented corrections. The check used a stub class rather than running Misskey’s frontend.

### Review entry 5: verification session of 2026-10-11 (`data/llm.csv` row 5)

**Claim to confirm:** The session's re-checks (test re-run, LOC/CC re-measure, median recomputation, source re-reading, Observer execution) were run and reproduce; labels in rows 1-4 follow from them.

**Inspect:**
- Prompts and assistant text: `Part3/llm/verification_session_prompts.txt` and `Part3/llm/outputs/verification_session_output.md`.
- Evidence: the Part 3 test logs, timing and LOC/CC files under `Part3/evidence/`, and the session prompts and output named above.
- Labels: section 7 of this file and `data/llm.csv` rows 1-4.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `disputed`
- Evidence inspected: `verification_session_prompts.txt`; `verification_session_output.md`; review evidence logs; sections 0, 7 and 8.
- Notes or discrepancies: The supporting scripts and outputs are available, but the verification was produced and checked by the same model family, so it is not independent confirmation of its own conclusions.

### Review entry 6: slide deck (`data/llm.csv` row 6)

**Claim to confirm:** The slide figures, pattern list, methodology, limitations and scope note agree with `data/cross_language.csv` and the evidence.

**Inspect:**
- Deck and outline: `Part3/llm/A13_slide.pdf` (pages 2-6), `Part3/llm/slide_outline.md`.
- Data: `data/cross_language.csv`, `Part3/evidence/environment.txt`, `Part3/evidence/timing/raw_timing.csv`.
- Prompt: prompt D3 in `Part3/llm/deliverables_session_prompts.txt`.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `corrected`
- Evidence inspected: `A13_slide.pdf`; `slide_outline.md`; `cross_language.csv`; environment and timing evidence; deliverable check output.
- Notes or discrepancies: The current slide figures and scope note match the project data and automated checks.

### Review entry 7: Part 3 report (`data/llm.csv` row 7)

**Claim to confirm:** The report's tables, counts, scope note (4 frontend / 11 backend instances), technology discussion and references agree with the data and the sources consulted.

**Inspect:**
- Report: `Part3/A13_Part3_Report.pdf` sections 4 to 6 and the reference list.
- Data: `data/cross_language.csv`, `data/llm.csv`, `Part3/README.md`, `README.md`, `Part3/evidence/test-logs/`.
- Prompt: prompt D5 in `Part3/llm/deliverables_session_prompts.txt`.

| Field | Entry |
|---|---|
| Reviewer | Sreehari M |
| Register number | AM.SC.U4CSE23156 |
| Actual review date |11/10/2026 |

- Outcome: `corrected`
- Evidence inspected: `A13_Part3_Report.pdf`; `cross_language.csv`; `llm.csv`; Part 3 README; test logs; deliverable check output.
- Notes or discrepancies: The current report’s tables, counts and scope note match the project data and automated checks; the technology discussion and scope details are included in the revised report.
