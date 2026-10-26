<!-- Saved verbatim. Model: Claude Opus 5.5 (claude.ai, Claude Code on the web), 2026-10-10.
     Part A = the chat reply. Part B = the file the model wrote (part2-change-designs.md). -->

# Part A: chat reply

I've written up all three changes in [part2-change-designs.md](/mnt/project-files/junit-case-study/part2-change-designs.md). Each one answers your seven questions, and I checked every path and line number against commit f59f60d.

- **CH01, summary listener:** JUnit's `SummaryGeneratingListener` only counts totals for the whole run. You'd build a `ClassSummaryListener` that gives per-class results plus the N slowest tests, writes them to a file, and is switched on and configured in `junit-platform.properties`. JUnit's existing listener hook is enough; registering it inside JUnit is one new file and two one-line edits. The refactoring is the counting code that `SummaryGeneratingListener` repeats five times.
- **CH02, resource extension:** Today only temp directories get created, injected and cleaned up for you. You'd build `@ManagedResource(SomeFactory.class)` for any type. Where the parameter is declared sets the lifetime: a test or `@BeforeEach` parameter gets one per test, a `@BeforeAll` parameter gets one per class. It needs three new files and edits nothing in JUnit, so I found no refactoring worth doing here, and the write-up explains why.
- **CH03, filtering policy:** No JUnit filter can be set from configuration. You'd build a policy with an `off`, `exclude` or `only` mode applied to a set of tags or method patterns. This one needs a small change to JUnit itself: one new class, one line in the discovery code and three settings keys. The refactoring is pulling the filter-collecting step out of a long method first.

None of the three replaces or removes a pattern from your Part 1 list. Each one adds to an existing Observer or Strategy use and leaves the rest as they are.

If your assignment needs a refactoring for every change, CH02 doesn't have a real one, so the write-up says that openly rather than inventing one.

I'd do CH03 first, because it's the only change that edits JUnit's own code.

# Part B: part2-change-designs.md

# Part 2: change designs for CH01, CH02, CH03

JUnit 6.1.3, commit `f59f60d` ("Release 6.1.3"). Every path and line number below was checked against that commit. Paths are relative to the repository root; to open one on GitHub use `https://github.com/junit-team/junit-framework/blob/f59f60d/<path>#L<line>`.

Pattern names in question 6 refer to the Part 1 analyses in this folder (`area-a` to `area-d-design-patterns.md`).

| Change | What you build | Touches existing JUnit code? | New files |
|---|---|---|---|
| CH01 | `ClassSummaryListener`: per-class result table plus the N slowest tests, written to a file | Two registration lines only | 1 |
| CH02 | `@ManagedResource` + `ResourceFactory<T>` + `ManagedResourceExtension` | No | 3 |
| CH03 | `FilterPolicy`: one `exclude` / `only` / `off` switch for a set of tags and method patterns, read from configuration | Yes, one call site plus 3 constants | 1 |

---

## CH01: a test execution listener that produces a custom summary

### 1. What already exists

| What | Where | Notes |
|---|---|---|
| Listener interface | `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TestExecutionListener.java:76` | Eight `default` no-op callbacks (lines 86–201): `testPlanExecutionStarted/Finished`, `dynamicTestRegistered`, `executionSkipped/Started/Finished`, `reportingEntryPublished`, `fileEntryPublished`. |
| Built-in summary | `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/SummaryGeneratingListener.java:36` | Counts found/started/skipped/aborted/succeeded/failed for containers and tests, and collects failures. |
| Summary data | `.../listeners/TestExecutionSummary.java` (getters 34–162, `printTo` 123) and `.../listeners/MutableTestExecutionSummary.java:38` (twelve `AtomicLong` counters, lines 48–60) | Totals only. |
| A config-driven, auto-registered listener to copy | `.../listeners/UniqueIdTrackingListener.java` | Off by default (`enabled` read at line 147), keys under `junit.platform.listeners.uid.tracking.*` (104–129), writes a file at `testPlanExecutionFinished` (183–203) and logs instead of throwing on I/O errors (190, 201). |
| Auto-registration | `.../src/main/resources/META-INF/services/org.junit.platform.launcher.TestExecutionListener` (lists only `UniqueIdTrackingListener`), `junit-platform-launcher/src/main/java/module-info.java:46-47` (`provides … with`), loaded in `.../core/LauncherFactory.java:195-210` | Line 206 applies `junit.platform.execution.listeners.deactivate` (`LauncherConstants.java:142`) so users can switch any auto-registered listener off. |
| Where listeners are called | `.../core/EngineExecutionOrchestrator.java:104` (plan started), `:113` (plan finished), `.../core/ExecutionListenerAdapter.java:46-57` (engine events → `TestIdentifier` events) | |
| Broadcasting and error isolation | `.../core/CompositeTestExecutionListener.java:104-116` | Each listener call is wrapped in try/catch; exceptions are logged, `OutOfMemoryError` is rethrown. |

### 2. The gap

`SummaryGeneratingListener` gives one set of totals for the whole run. It cannot tell you:

- which test class the failures and skips came from (no grouping),
- how long anything took (it records only the overall start and finish time, `MutableTestExecutionSummary.java:65-68`),
- anything without code: it is not auto-registered and has no configuration keys, so a Maven or Gradle user can only see it through the Console Launcher.

That is what you build: a per-class breakdown plus the slowest tests, switched on and tuned from `junit-platform.properties`.

### 3. Design

One class, `org.junit.platform.launcher.listeners.ClassSummaryListener implements TestExecutionListener`, modelled on `UniqueIdTrackingListener`.

Configuration keys (constants on the class, same style as `UniqueIdTrackingListener`):

| Key | Default | Meaning |
|---|---|---|
| `junit.platform.listeners.summary.enabled` | `false` | Master switch. |
| `junit.platform.listeners.summary.slowest` | `5` | How many slowest tests to list (0 = none). |
| `junit.platform.listeners.summary.output.file` | `junit-class-summary.txt` | File name, created in `testPlan.getOutputDirectoryCreator().getRootDirectory()` (`TestPlan.java:310`, `OutputDirectoryCreator.java:33`). |

State, all thread-safe because Jupiter can run tests in parallel:

```java
private final Map<UniqueId, Long> startNanos = new ConcurrentHashMap<>();
private final Map<String, ClassRow> rows = new ConcurrentHashMap<>();   // key: class name
private final Queue<TestTiming> timings = new ConcurrentLinkedQueue<>();
record TestTiming(String displayName, String className, long nanos) {}
static final class ClassRow { final AtomicLong total, passed, failed, aborted, skipped, nanos; }
```

Behaviour:

- `testPlanExecutionStarted`: read the three keys from `testPlan.getConfigurationParameters()`; if not enabled, every other callback returns immediately.
- `executionStarted` (tests only): put `System.nanoTime()` in `startNanos`.
- `executionFinished` (tests only): duration = now − start (skip timing if no start was recorded); bump the row for the test's class (from its `MethodSource.getClassName()`, else `"(other)"`); add a `TestTiming`.
- `executionSkipped`: count the test and its test descendants as skipped (same walk as `SummaryGeneratingListener.java:85-90`).
- `testPlanExecutionFinished`: write a fixed-width table (class, total, passed, failed, aborted, skipped, time) plus the N slowest tests, sorted by duration descending.

Registration: add one line to the `META-INF/services` file and `ClassSummaryListener` to the `provides` clause in `module-info.java`.

Acceptance criteria (drive them with `LauncherFactory.create(LauncherConfig.builder()…)` on a small fixture class, output dir set to a `@TempDir`):

1. **Off by default.** With no keys set, no file is written and the other listeners' results are unchanged.
2. **Correct per-class rows.** For a fixture with 2 passing, 1 failing and 1 `@Disabled` test, the file has one row `Fixture 4 2 1 0 1`, and the grand totals equal `SummaryGeneratingListener`'s counts from the same run.
3. **Slowest list.** With `slowest=2` and fixture tests that sleep 300 ms, 150 ms and 0 ms, exactly the 300 ms and 150 ms tests are listed, in that order.
4. **Bad input never breaks the run.** With `slowest=abc` (or `-1`), the run completes with the same test results, a warning is logged, and 5 is used. With an output directory that cannot be written, an error is logged and the run still succeeds.

### 4. Extension point only, or JUnit change?

Existing extension points are enough. A `TestExecutionListener` can be registered through `ServiceLoader` from any jar, or through `LauncherConfig.builder().addTestExecutionListeners(…)`. No existing JUnit behaviour has to change.

Because Part 2 asks you to change JUnit itself, put the class next to `SummaryGeneratingListener`:

- **New:** `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/ClassSummaryListener.java`
- **Edit (1 line):** `junit-platform-launcher/src/main/resources/META-INF/services/org.junit.platform.launcher.TestExecutionListener`
- **Edit (1 line):** `junit-platform-launcher/src/main/java/module-info.java:46-47`
- **Optional refactoring (section 7):** `.../listeners/SummaryGeneratingListener.java`

The `listeners` package is already exported (`module-info.java:36`), so no other module changes are needed.

### 5. Call order and failure behaviour

Order JUnit calls your code in:

1. `LauncherFactory.create` loads the listener by `ServiceLoader`, unless the deactivate pattern excludes it (`LauncherFactory.java:197-209`).
2. `testPlanExecutionStarted(testPlan)`: `EngineExecutionOrchestrator.java:104`. Listeners are called in **registration order** (`CompositeTestExecutionListener.java:78`, `IterationOrder.ORIGINAL`).
3. For each node, the engine's `NodeTestTask` reports events (`NodeTestTask.java:158`, `:224`), and `ExecutionListenerAdapter` turns them into `executionStarted` / `executionSkipped` / `executionFinished` on `TestIdentifier`s. `executionFinished` and `testPlanExecutionFinished` run in **reverse** registration order (`CompositeTestExecutionListener.java:71`, `:85`). With parallel execution these calls come from several threads at once.
4. `testPlanExecutionFinished(testPlan)`: `EngineExecutionOrchestrator.java:113`. This is where you write the file.
5. In dry-run mode (`junit.platform.execution.dryRun.enabled`), step 3 is replaced by `executionSkipped` for every test (`EngineExecutionOrchestrator.java:120-140`), so the summary shows everything as skipped.

If a **test fails**: nothing special happens to your code. You get `executionFinished` with `TestExecutionResult.Status.FAILED` and count it.

If **your listener throws**: `CompositeTestExecutionListener.notifyEach` (lines 104–116) catches it, logs a warning naming your class and the callback, and carries on with the next listener. Test results are not affected. Only unrecoverable errors such as `OutOfMemoryError` are rethrown (line 111). Your state may then be incomplete, for example a missing start time, so `executionFinished` must cope with that rather than throw again.

If the **configuration is wrong**: `ConfigurationParameters.get(key, transformer)` wraps a parse failure in a `JUnitException` (`ConfigurationParameters.java:120-129`). If you let that escape `testPlanExecutionStarted`, the composite logs it and your listener stays half-initialised. So catch it, log a warning and use the default (criterion 4). I/O errors at the end are logged, never thrown, as `UniqueIdTrackingListener` does.

### 6. Patterns from Part 1

| Pattern (Part 1 area) | Effect | Why |
|---|---|---|
| Observer: `TestExecutionListener` (C, also B) | **Extended** | One more concrete observer. The subject and the event set don't change. |
| Composite-shaped broadcaster `CompositeTestExecutionListener` (C, "uncertain") | **Preserved** | Your listener is one more entry in its list, and it is what isolates your exceptions. |
| Strategy: `IterationOrder` (C) | **Preserved** | Matters for you because it decides that your "finished" callbacks run in reverse order. |
| Adapter: `ExecutionListenerAdapter` (B) | **Preserved** | It is what delivers engine events to you as `TestIdentifier`s. |
| Decorators on the engine listener: `OutcomeDelaying…`, `StackTracePruning…` (B) | **Preserved** | Untouched. |
| Null Object: `EngineExecutionListener.NOOP` (C) | **Preserved** | Not used. "Disabled" is an `enabled` flag, as in `UniqueIdTrackingListener`, not a Null Object. |
| Newly introduced / replaced / removed | **None** | A single listener needs no new pattern; adding one would be over-design. |

### 7. Code smell and refactoring

**Smell: Duplicated Code in `SummaryGeneratingListener`.** The same pair

```java
if (testIdentifier.isContainer()) { summary.containersX.incrementAndGet(); }
if (testIdentifier.isTest())      { summary.testsX.incrementAndGet(); }
```

appears five times (lines 73–78, 100–105, 115–120, 124–129, 133–138), and `executionSkipped` builds the same `concat(Stream.of(id), descendants)` stream twice (lines 85–90). Your new listener needs the same "container vs test" counting, so this is the code you are copying from.

**Refactoring:** use Extract Method to create `private static void count(TestIdentifier id, AtomicLong containers, AtomicLong tests, long delta)`, and build the descendant list once in `executionSkipped`. Keep two separate `if`s, not `if/else`: `TestDescriptor.Type.CONTAINER_AND_TEST` (`TestDescriptor.java:408`) is both a container and a test. The behaviour is unchanged, and `platform-tests/src/test/java/org/junit/platform/launcher/listeners/SummaryGenerationTests.java` already covers it.

---

## CH02: a Jupiter extension for a resource created and cleaned up around tests

### 1. What already exists

| What | Where | Notes |
|---|---|---|
| Lifecycle callbacks | `junit-jupiter-api/src/main/java/org/junit/jupiter/api/extension/BeforeAllCallback.java:64`, `AfterAllCallback.java:64`, `BeforeEachCallback.java:67`, `AfterEachCallback.java:67` | The raw hooks. You write create, store and cleanup yourself every time. |
| Parameter injection | `.../api/extension/ParameterResolver.java:69` | Resolution and error wrapping: `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/ParameterResolutionUtils.java:130-180`. |
| Per-context store with automatic close | `ExtensionContext.Store` (`.../api/extension/ExtensionContext.java:526`), `computeIfAbsent` (768, 839); engine side `junit-platform-engine/.../support/store/NamespacedHierarchicalStore.java` (`close()` 135–160, reverse insertion order; parent lookup 465–471); close policy `junit-jupiter-engine/.../descriptor/AbstractExtensionContext.java:103-123` | Stored `AutoCloseable` values are closed when their context ends, unless `junit.jupiter.extensions.store.close.autocloseable.enabled=false` (`junit-jupiter-api/.../api/Constants.java:118`). |
| `@TempDir` | `junit-jupiter-api/.../api/io/TempDir.java:98`, `junit-jupiter-engine/.../engine/extension/TempDirectory.java:72` | Creates, injects (fields and parameters) and deletes, with a pluggable `TempDirFactory` and `CleanupMode`. **Only for `Path`/`File`** (`TempDirectory.java:208-211`). |
| `@AutoClose` | `junit-jupiter-api/.../api/AutoClose.java:82`, `junit-jupiter-engine/.../engine/extension/AutoCloseExtension.java:44` | Closes a field after the test or class. **You still create the resource yourself**, and only fields are supported. |
| Default registration | `junit-jupiter-engine/.../engine/extension/MutableExtensionRegistry.java:54-61, 86` | Where `TempDirectory` and `AutoCloseExtension` are registered. |
| Closest public helper | `junit-jupiter-api/.../api/extension/support/TypeBasedParameterResolver.java:33` | Shows that `junit-jupiter-api` already ships an extension implementation in `extension.support`. |

### 2. The gap

JUnit has a complete create–inject–clean-up feature only for temporary directories. For any other resource (an embedded server, an in-memory database, a client with a connection pool) you either:

- write a full extension yourself (callbacks plus store), or
- create it yourself in a field and add `@AutoClose`, which gives you no scoping, no sharing between `@BeforeAll` and tests, and no parameters.

What's missing is a declarative, type-agnostic "give me a `T` made by factory `F`, scoped to where I asked for it, and clean it up for me". That is what you build.

### 3. Design

Three small types in `junit-jupiter-api`, package `org.junit.jupiter.api.extension.support`. The package is already exported (`junit-jupiter-api/src/main/java/module-info.java:29`), so `module-info` doesn't change.

```java
public interface ResourceFactory<T> {
    T create(ExtensionContext context) throws Exception;
    default void destroy(T resource) throws Exception {
        if (resource instanceof AutoCloseable c) c.close();
    }
}

@Target(PARAMETER) @Retention(RUNTIME) @Documented
@ExtendWith(ManagedResourceExtension.class)        // self-registering, no @ExtendWith needed by users
public @interface ManagedResource {
    Class<? extends ResourceFactory<?>> value();
}

public class ManagedResourceExtension implements ParameterResolver {
    private static final Namespace NS = Namespace.create(ManagedResourceExtension.class);

    public boolean supportsParameter(ParameterContext p, ExtensionContext c) {
        return p.isAnnotated(ManagedResource.class) && p.getDeclaringExecutable() instanceof Method;
    }

    public Object resolveParameter(ParameterContext p, ExtensionContext c) {
        var factoryType = p.findAnnotation(ManagedResource.class).orElseThrow().value();
        return c.getStore(NS)
                .computeIfAbsent(factoryType, t -> Holder.create(ReflectionSupport.newInstance(t), c), Holder.class)
                .resource();
    }

    @SuppressWarnings("deprecation")   // same dual interface as TempDirectory.CloseablePath (line 255)
    record Holder(Object resource, ResourceFactory<Object> factory)
            implements AutoCloseable, ExtensionContext.Store.CloseableResource {
        public void close() throws Exception { factory.destroy(resource); }
    }
}
```

Scope comes from where the parameter is declared, with no extra option:

- Parameter on a **test or `@BeforeEach`/`@AfterEach` method**: the store of the method context. There is one instance per test, shared by `@BeforeEach` and the test, and destroyed after the test.
- Parameter on a **`@BeforeAll`/`@AfterAll` method**: the store of the class context. There is one instance per class, destroyed after `@AfterAll`. Because store lookups fall back to the parent (`NamespacedHierarchicalStore.java:465-471`), a test asking for the same factory reuses the class instance. `@Nested` classes reuse it too.

Usage:

```java
class RepoTests {
    @BeforeAll static void seed(@ManagedResource(H2Factory.class) DataSource ds) { … }
    @Test void finds(@ManagedResource(H2Factory.class) DataSource ds) { … }   // same instance as seed()
}
```

Acceptance criteria (Jupiter's `EngineTestKit` or plain fixture classes with a counting factory):

1. **Per-test lifecycle.** A test parameter gets an instance; `create` runs once and `destroy` runs once per test, after that test's `@AfterEach` methods. `@BeforeEach` and the test receive the same instance.
2. **Class scope.** When the same factory is requested in `@BeforeAll`, all tests in the class get that one instance, and `destroy` runs once, after `@AfterAll`.
3. **Cleanup despite failure.** When the test body fails, `destroy` still runs and the test reports the original assertion error.
4. **Errors are reported, not swallowed.** If `create` throws, the test fails with a `ParameterResolutionException` and `destroy` is not called. If `destroy` throws, the test that owned the resource is reported failed with that exception as the cause. A factory without a no-arg constructor, or one that returns the wrong type, gives a `ParameterResolutionException` that names the parameter.

### 4. Extension point only, or JUnit change?

**Existing extension points only.** It uses `ParameterResolver`, the `Store` close mechanism, `@ExtendWith` as a meta-annotation on a parameter (registered by `ExtensionUtils.registerExtensionsFromExecutableParameters`, `junit-jupiter-engine/.../descriptor/ExtensionUtils.java:187`), and `ReflectionSupport.newInstance` from platform-commons, which `junit-jupiter-api` already requires.

Files:

- **New:** `junit-jupiter-api/src/main/java/org/junit/jupiter/api/extension/support/ResourceFactory.java`
- **New:** `.../extension/support/ManagedResource.java`
- **New:** `.../extension/support/ManagedResourceExtension.java`
- **Edited:** none. You do *not* need to add it to `MutableExtensionRegistry`'s defaults, because the annotation registers it.

### 5. Call order and failure behaviour

For a class with one test that uses a method-scoped resource:

1. Class `before`: BeforeAll callbacks, then `@BeforeAll` methods (`ClassBasedTestDescriptor.java:247-251`). A class-scoped resource is **created here**, while the `@BeforeAll` parameter is being resolved.
2. The test method (`TestMethodTestDescriptor.java:146-166`) runs `BeforeEachCallback`s, then `@BeforeEach` methods (a resource requested here is **created here**), then `BeforeTestExecutionCallback`s, then the **test method's parameters are resolved** (created here if not already present, otherwise reused), then the test body, then `AfterTestExecutionCallback`s, `@AfterEach` methods and `AfterEachCallback`s.
3. Test `cleanUp` (`TestMethodTestDescriptor.java:170-175`): `TestInstancePreDestroyCallback`s run first, which includes `@AutoClose` fields. Then `JupiterTestDescriptor.cleanUp` (`:249-250`) closes the extension context, then the store (`NamespacedHierarchicalStore.java:135-160`), then your `Holder.close()`, then **`factory.destroy()`**.
4. Only then is the test reported finished to listeners (`NodeTestTask.java:118-121`: `cleanUp()` runs before `reportCompletion()`). This is why a `destroy` failure becomes part of the test's own result.
5. After all tests: `@AfterAll`, AfterAll callbacks, then class `cleanUp`, which **destroys class-scoped resources**.

If a **test fails**: the failure sits in the test's `ThrowableCollector`. All after-hooks and `cleanUp` still run, so `destroy` is called.

If **your code throws**:

- `create`, or the factory's constructor, throws: `ParameterResolutionUtils.java:168-178` wraps it in a `ParameterResolutionException`, which fails that test. If this happens in `@BeforeAll`, the class container fails and its tests do not run. A failed `computeIfAbsent` leaves nothing to close, so `destroy` is not called.
- `destroy` throws: the store collects every close failure, attaches the rest as suppressed exceptions and rethrows (`NamespacedHierarchicalStore.java:151-157`). `JupiterEngineExecutionContext.close` wraps that in `JUnitException("Failed to close extension context")` (`JupiterEngineExecutionContext.java:47-55`), which fails the test. If the test had already failed, `ThrowableCollector` keeps both errors, one suppressed in the other (`ThrowableCollector.java:89-101`).

If the **configuration is wrong**:

- A factory without a no-arg constructor, or an abstract one, fails at `newInstance` and you get a `ParameterResolutionException`.
- A factory that returns a type not assignable to the parameter is caught by `validateResolvedType` (`ParameterResolutionUtils.java:156`).
- A constructor parameter is not supported (`supportsParameter` returns `false`), which gives the standard "No ParameterResolver registered" error.
- With `junit.jupiter.extensions.store.close.autocloseable.enabled=false`, stored `AutoCloseable`s are **not** closed (`AbstractExtensionContext.java:106-121`). That is why `Holder` also implements the deprecated `Store.CloseableResource`, exactly as `TempDirectory` does (lines 255 and 325). Add a test for this case.

### 6. Patterns from Part 1

| Pattern (Part 1 area) | Effect | Why |
|---|---|---|
| Strategy: `TempDirFactory`, `ParameterResolver` (D 1a, 1c) | **Extended** | `ResourceFactory<T>` is a new Strategy family built the same way as `TempDirFactory`, and `ManagedResourceExtension` is one more `ParameterResolver` strategy. |
| Strategy: `NamespacedHierarchicalStore.CloseAction` (D 1e) | **Preserved** | Cleanup runs through JUnit's existing close action. You don't add your own. |
| Adapter: `NamespaceAwareStore` (D 2a) | **Preserved** | You use the Jupiter `Store` API it provides. |
| Observer: `TestWatcher` (D 3a) | **Preserved** | Not used. Cleanup must happen whatever the outcome, so it belongs in the store and not in an observer. |
| Chain of Responsibility: `InvocationInterceptorChain` (D 6a), Decorator timeouts (D 7), Command `MethodInvocation` (D 8) | **Preserved** | Untouched. |
| Template Method (D, rejected) | Still **absent** | You implement interfaces; nothing is subclassed. |
| Newly introduced / replaced / removed | **None** | `Holder` is a plain value wrapper, not a pattern. |

### 7. Code smell and refactoring

No refactoring is justified here, because CH02 adds three new files and edits no JUnit code.

The nearest candidate is the two parallel close paths. `TempDirectory.CloseablePath` (line 255) and `FailureTracker` (line 325) implement both `AutoCloseable` and the deprecated `Store.CloseableResource`, and `AbstractExtensionContext.createCloseAction` (lines 103–123) branches on both. That is a "deprecated parallel path" smell, but removing it would change behaviour for anyone who set the auto-close flag to `false`. That makes it a behaviour change, not a refactoring, and it belongs to JUnit's own deprecation schedule. If your assignment needs one refactoring per change, say this explicitly. If you want a refactoring to count, the CH01 and CH03 ones are real.

---

## CH03: extend test selection with a configurable filtering policy

### 1. What already exists

| What | Where | Notes |
|---|---|---|
| Filter contracts | `junit-platform-engine/src/main/java/org/junit/platform/engine/Filter.java:41`, `FilterResult.java:28`; `junit-platform-launcher/.../launcher/PostDiscoveryFilter.java:35` | `apply(TestDescriptor) → FilterResult`. |
| Ready-made filters | `.../launcher/TagFilter.java:68-125` (tag expressions), `.../launcher/MethodFilter.java:46-103` + `IncludeMethodFilter.java:38` / `ExcludeMethodFilter.java:38` (regex on `com.x.Foo#bar`), `.../launcher/EngineFilter.java:55-100`; discovery filters `.../engine/discovery/ClassNameFilter.java:56,73`, `PackageNameFilter.java:45-99` | All are built **in code** and passed on the request (`LauncherDiscoveryRequestBuilder.filters(…)`, line 193). |
| Combining filters | `Filter.composeFilters` (`Filter.java:78`) → `CompositeFilter.apply` (`CompositeFilter.java:59`) | Logical AND: every filter must include. |
| Auto-registered filters | `.../launcher/core/LauncherFactory.java:178-185` | `ServiceLoader<PostDiscoveryFilter>`, created once with a no-arg constructor when the launcher is built. |
| Where filters run | `.../launcher/core/EngineDiscoveryOrchestrator.java:180-184` (collect and apply), `225-238` (visitor removes excluded leaves), `246-262` (logs exclusion reasons), `265-271` (prune) | |
| Jupiter-side runtime skipping | `junit-jupiter-api/.../extension/ExecutionCondition.java:58`, `junit.jupiter.conditions.deactivate` (`api/Constants.java:154`) | Runs at execution time, Jupiter only, and reports *skipped* rather than removing tests. |

### 2. The gap

- **No filter can be configured from configuration parameters.** No production `PostDiscoveryFilter` reads `ConfigurationParameters`. `apply(TestDescriptor)` never receives them, and the `ServiceLoader` instance is created before any request exists (`LauncherFactory.java:141`). Tag and method filters exist only if your build tool or the Console Launcher builds them, each with its own syntax.
- **No "policy" switch.** To quarantine flaky tests you need an *exclude* filter in the normal CI job and an *include* filter with the same list in a quarantine job, configured twice in two different places. Nothing lets one setting flip between `exclude` and `only` for the same set of tests.
- **Asymmetry:** auto-registered listeners can be deactivated by pattern (`LauncherFactory.java:206`), but auto-registered filters cannot be configured at all.

You build a **filter policy**: one named set of tests (tag expressions and/or method-name patterns) plus a mode, all set from `junit-platform.properties`, system properties or build-tool configuration parameters.

### 3. Design

Three keys in `LauncherConstants`:

| Key | Values | Default |
|---|---|---|
| `junit.platform.filter.policy.mode` | `off`, `exclude`, `only` | `off` |
| `junit.platform.filter.policy.tags` | comma-separated tag expressions, e.g. `flaky, slow & !smoke` | empty |
| `junit.platform.filter.policy.methods` | comma-separated regexes on `com.x.Foo#bar` | empty |

One package-private class, `org.junit.platform.launcher.core.FilterPolicy implements PostDiscoveryFilter`:

```java
final class FilterPolicy implements PostDiscoveryFilter {
    enum Mode { OFF, EXCLUDE, ONLY }

    static Optional<PostDiscoveryFilter> fromConfiguration(ConfigurationParameters config) {
        Mode mode = parseMode(config);                        // throws JUnitException naming the key
        if (mode == Mode.OFF) return Optional.empty();
        List<Predicate<TestDescriptor>> matchers = new ArrayList<>();
        tags(config).ifPresent(t -> matchers.add(TagFilter.includeTags(t).toPredicate()));
        methods(config).ifPresent(m -> matchers.add(MethodFilter.includeMethodNamePatterns(m).toPredicate()));
        if (matchers.isEmpty()) throw new JUnitException("…policy.mode=" + mode + " but no tags or methods set");
        return Optional.of(new FilterPolicy(mode, matchers));
    }

    public FilterResult apply(TestDescriptor d) {
        boolean matches = matchers.stream().anyMatch(m -> m.test(d));   // OR across tags and methods
        return mode == Mode.EXCLUDE
            ? FilterResult.includedIf(!matches, () -> "not in filter policy", () -> "excluded by filter policy")
            : FilterResult.includedIf(matches,  () -> "in filter policy",     () -> "not in filter policy (mode=only)");
    }
}
```

It reuses `TagFilter` and `MethodFilter` for parsing and matching, so there is no new tag or regex syntax. Containers don't need special handling: the orchestrator removes only excluded *leaves* (`isExcluded`, `EngineDiscoveryOrchestrator.java:269-271`) and then prunes empty containers.

Wiring, in `EngineDiscoveryOrchestrator.discoverSafely`:

```java
List<PostDiscoveryFilter> filters = new ArrayList<>(postDiscoveryFilters);
filters.addAll(request.getPostDiscoveryFilters());
FilterPolicy.fromConfiguration(request.getConfigurationParameters()).ifPresent(filters::add);   // new
```

Acceptance criteria (use `LauncherFactory.create()` and `LauncherDiscoveryRequestBuilder.request().selectors(selectClass(Fixture.class)).configurationParameter(…)`, then inspect `launcher.discover(request)`):

1. **Off is a no-op.** With no keys set, or `mode=off`, the `TestPlan` contains the same tests as on unmodified JUnit.
2. **Exclude.** With `mode=exclude` and `tags=flaky`, every `@Tag("flaky")` test is missing from the `TestPlan`, all others are present, and a class left with no tests disappears.
3. **Only.** With `mode=only` and `methods=.*Fixture#fast.*`, only the matching methods remain. Combined with a request `TagFilter.includeTags("smoke")`, the result is the *intersection*, because the policy narrows and never re-includes.
4. **Bad config fails fast.** `mode=bogus`, `mode=only` with no tags or methods, an invalid tag expression (`flaky &`), or an invalid regex all make `launcher.discover` throw a `JUnitException` whose message names the offending key. No tests run.

### 4. Extension point only, or JUnit change?

**A small JUnit change is needed** to do this properly. With only the existing extension point (a `ServiceLoader` `PostDiscoveryFilter`), the filter cannot see request configuration, so you'd have to:

- read `System.getProperty` or parse `junit-platform.properties` yourself, which duplicates JUnit's configuration logic and ignores build-tool parameters; or
- capture the request in a `LauncherDiscoveryListener.launcherDiscoveryStarted(request)` (`LauncherDiscoveryListener.java:57`) and pass it to the filter through static state. That works, but it is global mutable state and breaks with concurrent launchers.

Mention that workaround in the write-up as the rejected alternative.

Files:

- **New:** `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/FilterPolicy.java` (package-private, so it adds no public API)
- **Edit:** `.../launcher/LauncherConstants.java`: three `public static final String` keys, documented like the existing ones (e.g. line 142)
- **Edit:** `.../launcher/core/EngineDiscoveryOrchestrator.java`: one line after line 181 (plus the refactoring in section 7)

No `module-info` change: `org.junit.platform.launcher.core` is already exported (`module-info.java:35`).

### 5. Call order and failure behaviour

1. `LauncherFactory.create` collects the service-loaded filters (`LauncherFactory.java:178-185`). Your policy is **not** created here.
2. `Launcher.discover(request)`, or `execute(request)`, which discovers first, calls `EngineDiscoveryOrchestrator.discover` (106). That notifies `launcherDiscoveryStarted` (115) and runs every engine's `discover` (`discoverSafely`, 156–178).
3. `discoverSafely` builds the filter list in this order: service-loaded, request filters, then **`FilterPolicy.fromConfiguration(...)`**. This is where configuration is parsed and validated, once per discovery.
4. `applyPostDiscoveryFilters` (225) composes them with AND (`CompositeFilter`) and walks every descriptor top-down (`TestDescriptor.accept`, `TestDescriptor.java:345-349`), calling **your `apply`** for each one. Excluded leaves are removed, and the reasons are logged at CONFIG/DEBUG level (246–262).
5. `prune` (265) removes empty containers, then `launcherDiscoveryFinished`, and the `TestPlan` is built.
6. Execution: filtered-out tests are **absent** from the `TestPlan`. They are not "skipped", so listeners, including CH01's summary, never hear of them.

If a **test fails**: it doesn't matter. The policy runs before execution. Note also that dynamic tests (`@TestFactory`) are registered during execution and are never passed through post-discovery filters; only their factory method is.

If **your code throws in `apply`**: there is no protection. Only engine discovery is wrapped in try/catch (`discoverEngineRoot`, 189–216). An exception from `applyPostDiscoveryFilters` escapes `Launcher.discover`, and the whole run aborts. That is why all parsing happens in `fromConfiguration`, and `apply` only evaluates already-parsed predicates.

If the **configuration is wrong**: fail fast with a `JUnitException` that names the key (criterion 4). Running silently with everything included would defeat the purpose of the policy. This matches how JUnit treats bad values elsewhere (`ConfigurationParameters.java:120-129`). An empty tag list or method list in `exclude` mode is also an error, not a silent no-op.

### 6. Patterns from Part 1

| Pattern (Part 1 area) | Effect | Why |
|---|---|---|
| Strategy: `Filter` / `PostDiscoveryFilter` applied by `EngineDiscoveryOrchestrator` (A 2) | **Extended** | `FilterPolicy` is one more interchangeable filter. The orchestrator still doesn't know which concrete filters it runs. |
| Composite: `CompositeFilter` (A 1) | **Preserved** | The policy is one more leaf in the AND composite. Internally it needs OR, so it does **not** reuse `CompositeFilter`, which is AND-only. |
| Composite: `TestDescriptor` tree, `prune` (A 1) | **Preserved** | Removal and pruning are unchanged. |
| Adapter: `Filter.toPredicate()` (A 5c) | **Preserved and reused** | Turns `TagFilter` / `MethodFilter` into predicates the policy can OR together. |
| Observer: `LauncherDiscoveryListener` (A 4) | **Preserved** | Deliberately *not* used for the static-state workaround. |
| Strategy via enum (like `IterationOrder`, C 3a) | **Newly introduced (new instance of a known pattern)** | `Mode` selects exclude or only behaviour. It is a small enum Strategy, not a new pattern family. Avoid calling `fromConfiguration` a GoF Factory Method: it is a static factory. |
| Replaced / removed | **None** | |

### 7. Code smell and refactoring

**Smell: Long Method with mixed levels of abstraction.** `EngineDiscoveryOrchestrator.discoverSafely` (lines 156–187) does five things in one body: it filters engines, discovers each engine, runs sanity checks, assembles the post-discovery filter list (180–181) and applies and prunes. Your change adds a third source to the filter list, which makes the assembly step longer still.

**Refactoring:** extract lines 180–181 into `private List<PostDiscoveryFilter> collectPostDiscoveryFilters(LauncherDiscoveryRequest request)` *before* adding the policy line, then add the policy inside that method. `discoverSafely` then reads as "discover, collect filters, apply, prune". It is behaviour-preserving, and `platform-tests/.../launcher/core/DefaultLauncherTests.java` covers filter application.

The `LauncherFactory` methods that repeat "if auto-registration is on, `ServiceLoader.load`, then add the extra ones" (lines 159–210, five near-copies) are also duplicated code, but merging them touches five call sites. That is too big for a solo change, so mention it and leave it.

---

## Suggested order of work

1. **CH03** first: it is the only change that edits JUnit internals, and its refactoring comes before the feature.
2. **CH01**: purely additive, and you can use it to show CH03's effect, since filtered tests never reach the summary.
3. **CH02**: fully self-contained.
