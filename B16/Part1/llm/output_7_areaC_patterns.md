<!-- Raw output of Part 1, prompt 7 (Part1/llm/prompt_7_areaC_patterns.txt), same Claude chat.
     Copied verbatim: section 1 = chat reply, section 2 = attached file area-c-design-patterns.md. -->

# 1. Chat reply

The area C pattern analysis is ready: [area-c-design-patterns.md](/mnt/project-files/junit-case-study/area-c-design-patterns.md). Each pattern has its roles, paths, line numbers, snippets and a verdict, and I rechecked every line against commit f59f60d.

- **Observer: confirmed, and it's the core of area C.** `TestExecutionListener` and `LauncherSessionListener` are the observer interfaces. Listeners attach through `registerTestExecutionListeners`, through ServiceLoader (that's how `UniqueIdTrackingListener` gets in) or per request. `CompositeTestExecutionListener.notifyEach` notifies them all and isolates failures, so one broken listener doesn't affect the others. Two details are new compared with B: "finished" events go out in reverse order, so listeners nest like brackets, and `EagerTestExecutionListener` lets some listeners hear events first.
- **Composite: uncertain.** The three `Composite*Listener` classes have the Composite shape, but they're flat broadcasters with no part-whole tree. That's the same call I made in area A.
- **Strategy: confirmed, but small.** It shows up in the `IterationOrder` enum (ORIGINAL vs REVERSED), in `LoggingListener`'s pluggable `BiConsumer` that decides where log lines go, and in the composite factory that `ListenerRegistry` takes as a parameter.
- **Template Method: rejected.** The default methods are optional callbacks or convenience overloads. None of them is a fixed skeleton that calls overridable steps.
- **Adapter: confirmed for `DefaultTestReporter`.** It turns `TestReporter.publishEntry` into `ExtensionContext.publishReportEntry`. The JFR and logging listeners are only uncertain adapters; they're really just observers.
- **Two extras:** a strong **Decorator** in `StreamInterceptor`, which extends `PrintStream` and wraps `System.out`/`System.err`, and a small **Null Object** in `EngineExecutionListener.NOOP` and `LauncherSessionListener.NOOP`.

The file ends with a table of 10 look-alikes. Examples are `ListenerRegistry` (not the Registry pattern), `MutableTestExecutionSummary` (not a Builder) and `StreamInterceptingTestExecutionListener` (not the Interceptor pattern).

# 2. Attached file: area-c-design-patterns.md

# Area C: design patterns in execution listeners and result reporting

JUnit 6.1.3, commit `f59f60d2cebdf2224235d81f781b1f310cbc8138`. Every line number and snippet below was read from that commit. Snippets are trimmed; `…` marks omitted lines.

Path prefixes:
- `PE` = `junit-platform-engine/src/main/java/org/junit/platform/engine`
- `PL` = `junit-platform-launcher/src/main/java/org/junit/platform/launcher`
- `JA` = `junit-jupiter-api/src/main/java/org/junit/jupiter/api`
- `JE` = `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine`

**Not counted again** (already covered in areas A and B): `LauncherDiscoveryListener` and its composite; `NodeTestTask` pushing events to `EngineExecutionListener`; `ExecutionListenerAdapter`; and the `StackTracePruning…`, `OutcomeDelaying…` and `MemoryCleanupListener` wrappers. They appear below only where a class plays a new role.

## Verdicts at a glance

| Pattern | Verdict | Main classes | One-line reason |
|---|---|---|---|
| Observer | **Confirmed** (the core of area C) | `TestExecutionListener`, `LauncherSessionListener`; concrete observers `SummaryGeneratingListener`, `LoggingListener`, `UniqueIdTrackingListener`, `FlightRecordingExecutionListener`, `StreamInterceptingTestExecutionListener` | Many independent listeners register and are notified of the same run events without knowing about each other. |
| Composite | **Uncertain** (structural only) | `CompositeTestExecutionListener`, `CompositeEngineExecutionListener`, `CompositeLauncherSessionListener` | They implement the interface they hold a list of, which is the Composite shape, but they are flat broadcasters, not part-whole trees. |
| Strategy | **Confirmed** (small) | `IterationOrder`; `LoggingListener`'s log sink; `ListenerRegistry`'s composite factory | Interchangeable behaviour is passed in or chosen by enum. |
| Template Method | **Rejected** | `TestExecutionListener` default methods, `TestReporter`, `TestExecutionSummary` | No `final` skeleton calling overridable steps; the defaults are optional callbacks or convenience overloads. |
| Adapter | **Confirmed** for `DefaultTestReporter`; **uncertain** for `FlightRecordingExecutionListener` / `LoggingListener` | `DefaultTestReporter` | Turns the test-facing `TestReporter` API into `ExtensionContext.publishReportEntry`. |
| Decorator (extra) | **Confirmed** (strong) | `StreamInterceptor extends PrintStream` | Wraps `System.out` / `System.err`, tees every write into a buffer, and still forwards to the original stream. |
| Null Object (extra) | **Confirmed** (small) | `EngineExecutionListener.NOOP`, `LauncherSessionListener.NOOP` | Do-nothing listeners stand in for "no listener" so callers never check for null. |

Section 8 covers classes whose names suggest a pattern they don't really follow.

---

## 1. Observer: Confirmed (the core of area C)

### How it is used
One test run produces a stream of events (plan started, test started, skipped or finished, report entry published, plan finished). Any number of independent listeners can subscribe: the IDE, a summary counter, a logger, a unique-ID file writer, JFR, and stdout capture. The launcher keeps the list and pushes every event to all of them. None of the listeners knows the others exist.

Area A covered discovery listeners, and area B covered the engine pushing events into `EngineExecutionListener`. What's new here is the **client-side** observer interface, how observers register, how they are notified (including two ordering rules), and the **session-level** observer.

### Roles

| Role | Class / method |
|---|---|
| Observer interface (run events) | `TestExecutionListener` (`PL/TestExecutionListener.java:76`) |
| Observer interface (session events) | `LauncherSessionListener` (`PL/LauncherSessionListener.java:43`) |
| Registration (attach) | `Launcher.registerTestExecutionListeners(...)` → `DefaultLauncher.java:80-84`; automatic via `ServiceLoader` in `LauncherFactory.java:195-210`; per-request listeners in `EngineExecutionOrchestrator.buildListenerRegistryForExecution` (`:240-246`) |
| Notifier / dispatch | `CompositeTestExecutionListener.notifyEach` (`:104-116`), built by `ListenerRegistry.getCompositeListener()` |
| Subject (raises plan events) | `EngineExecutionOrchestrator` (plan events), `DefaultLauncherSession` (session events) |
| Concrete observers | `SummaryGeneratingListener`, `LoggingListener`, `UniqueIdTrackingListener`, `FlightRecordingExecutionListener`, `StreamInterceptingTestExecutionListener` |

### Evidence

The observer interface, in `PL/TestExecutionListener.java`. Every callback has an empty default, so a listener overrides only what it cares about:
```java
76:  public interface TestExecutionListener {
86:      default void testPlanExecutionStarted(TestPlan testPlan) {
…
146:     default void executionStarted(TestIdentifier testIdentifier) {
…
175:     default void executionFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
…
187:     default void reportingEntryPublished(TestIdentifier testIdentifier, ReportEntry entry) {
```

Attach, three ways:
```java
// PL/core/DefaultLauncher.java  (explicit registration)
80:      public void registerTestExecutionListeners(TestExecutionListener... listeners) {
…
83:          this.listenerRegistry.testExecutionListeners.addAll(listeners);

// PL/core/LauncherFactory.java  (automatic registration from the classpath)
197:         if (config.isTestExecutionListenerAutoRegistrationEnabled()) {
198:             loadAndFilterTestExecutionListeners(configurationParameters).forEach(
199:                 launcher::registerTestExecutionListeners);
…
209:         return ServiceLoaderRegistry.load(TestExecutionListener.class, classNameFilter);

// PL/core/EngineExecutionOrchestrator.java  (extra listeners for one run only)
240:     private ListenerRegistry<TestExecutionListener> buildListenerRegistryForExecution(
…
245:         return ListenerRegistry.copyOf(this.listenerRegistry).addAll(listeners);
```

`UniqueIdTrackingListener` is registered through the service file (`junit-platform-launcher/src/main/resources/META-INF/services/org.junit.platform.launcher.TestExecutionListener`, and `junit-platform-launcher/src/main/java/module-info.java:46-47`).

Notify, in `PL/core/CompositeTestExecutionListener.java`. Observers are isolated from each other's failures:
```java
28:  class CompositeTestExecutionListener implements TestExecutionListener {
…
67:      public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
68:          notifyEach(eagerTestExecutionListeners, IterationOrder.REVERSED,
69:              listener -> listener.executionJustFinished(testIdentifier, testExecutionResult),
…
71:          notifyEach(testExecutionListeners, IterationOrder.REVERSED,
72:              listener -> listener.executionFinished(testIdentifier, testExecutionResult),
…
104:     private static <T extends TestExecutionListener> void notifyEach(List<T> listeners, IterationOrder iterationOrder,
…
107:             try {
108:                 consumer.accept(listener);
109:             }
110:             catch (Throwable throwable) {
…
112:                 logger.warn(throwable, () -> "TestExecutionListener [%s] threw exception for method: %s".formatted(
```

Two notification rules worth noting for the case study:
1. **Bracket order.** "Started" events go to listeners in registration order, and "finished" events in reverse (lines 59-73), so listeners nest like brackets.
2. **Priority observers.** Listeners that implement the nested `EagerTestExecutionListener` (lines 118-124) get `executionJustStarted` before all other observers and `executionJustFinished` before them on the way out. `StreamInterceptingTestExecutionListener` uses this so stdout capture surrounds what every other listener sees.

A concrete observer that builds a result, in `PL/listeners/SummaryGeneratingListener.java`:
```java
36:  public class SummaryGeneratingListener implements TestExecutionListener {
…
58:      public void testPlanExecutionStarted(TestPlan testPlan) {
59:          this.testPlan = testPlan;
60:          this.summary = new MutableTestExecutionSummary(testPlan);
…
109:     public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
…
114:             case SUCCESSFUL -> {
…
119:                     summary.testsSucceeded.incrementAndGet();
…
132:             case FAILED -> {
…
137:                     summary.testsFailed.incrementAndGet();
…
139:                 testExecutionResult.getThrowable().ifPresent(
140:                     throwable -> summary.addFailure(testIdentifier, throwable));
```

Other concrete observers:
- `PL/listeners/LoggingListener.java:39` logs each event.
- `PL/listeners/UniqueIdTrackingListener.java:94` collects unique IDs and writes them to a file in `testPlanExecutionFinished` (line 183).
- `PL/jfr/FlightRecordingExecutionListener.java:43` turns events into JFR events.

The session-level observer, notified by `PL/core/DefaultLauncherSession.java`:
```java
71:          listener.launcherSessionOpened(this);
…
87:              listener.launcherSessionClosed(this);
```

### Note
Like areas A and B, this is the push-model **listener** form of Observer. Observers are collected in a `ListenerRegistry` and frozen into a single composite before each run; there is no `detach` during a run.

---

## 2. Composite: Uncertain (structural only)

### What matches
`CompositeTestExecutionListener`, `CompositeEngineExecutionListener` and `CompositeLauncherSessionListener` each implement the same interface as the objects they hold, and forward each call to all children. Callers can't tell one listener from many. That is the Composite shape.

```java
// PL/core/CompositeEngineExecutionListener.java
27:  class CompositeEngineExecutionListener implements EngineExecutionListener {
31:      private final List<EngineExecutionListener> engineExecutionListeners;
…
52:      public void executionStarted(TestDescriptor testDescriptor) {
53:          notifyEach(engineExecutionListeners, IterationOrder.ORIGINAL,

// PL/listeners/session/CompositeLauncherSessionListener.java
24:  class CompositeLauncherSessionListener implements LauncherSessionListener {
26:      private final List<LauncherSessionListener> listeners;
…
33:      public void launcherSessionOpened(LauncherSession session) {
34:          listeners.forEach(delegate -> delegate.launcherSessionOpened(session));
```

### Why only "uncertain"
GoF Composite is about **part-whole hierarchies**, where trees of objects are treated uniformly. These classes are always one level deep. They are built from a flat list by `ListenerRegistry.getCompositeListener()` (`PL/core/ListenerRegistry.java:87-90`), and their job is to fan one event out to many observers. That is the dispatch half of Observer (section 1), often called a **multicaster**. The area A discovery composite got the same verdict, for consistency. If your case study defines Composite purely by structure, you could upgrade this to "confirmed (flat)". By intent, it isn't Composite.

---

## 3. Strategy: Confirmed (small, three places)

### 3a. `IterationOrder`: the order observers are notified in

```java
// PL/core/IterationOrder.java
18:  enum IterationOrder {
20:      ORIGINAL {
22:          <T> void forEach(List<T> listeners, Consumer<T> action) {
23:              listeners.forEach(action);
…
27:      REVERSED {
29:          <T> void forEach(List<T> listeners, Consumer<T> action) {
30:              forEachInReverseOrder(listeners, action);
…
34:      abstract <T> void forEach(List<T> listeners, Consumer<T> action);
```

| Role | Class |
|---|---|
| Strategy | `IterationOrder` (abstract `forEach`) |
| Concrete strategies | `ORIGINAL`, `REVERSED` |
| Context | `notifyEach(...)` in `CompositeTestExecutionListener` (line 104) and `CompositeEngineExecutionListener` (line 78) |

### 3b. `LoggingListener`: where log lines go

The listener's behaviour is fixed, but the log sink is a pluggable `BiConsumer`:
```java
// PL/listeners/LoggingListener.java
62:      public static LoggingListener forJavaUtilLogging(Level logLevel) {
…
65:          return new LoggingListener((t, messageSupplier) -> logger.log(logLevel, t, messageSupplier));
…
82:      public static LoggingListener forBiConsumer(BiConsumer<@Nullable Throwable, Supplier<String>> logger) {
…
86:      private final BiConsumer<@Nullable Throwable, Supplier<String>> logger;
```

### 3c. `ListenerRegistry`: how the composite is built for each listener type

This is a new role compared with area A, where `ListenerRegistry` appeared only as the discovery broadcaster. One generic registry class serves four listener types because the "build a composite" step is passed in as a function:
```java
// PL/core/ListenerRegistry.java
29:      private final Function<List<T>, T> compositeListenerFactory;
…
39:      static ListenerRegistry<TestExecutionListener> forTestExecutionListeners() {
40:          return create(CompositeTestExecutionListener::new);
…
43:      static ListenerRegistry<EngineExecutionListener> forEngineExecutionListeners() {
44:          return create(CompositeEngineExecutionListener::new);
…
87:      T getCompositeListener() {
…
89:          return compositeListenerFactory.apply(this.listeners);
```

You could also call this an injected factory. Either way the behaviour varies by plugging in a function, not by subclassing.

---

## 4. Template Method: Rejected

I checked three candidates. None of them has a `final` (or fixed) skeleton that calls overridable steps:
- **`TestExecutionListener` / `EngineExecutionListener` / `LauncherSessionListener`.** All methods are empty defaults (`PL/TestExecutionListener.java:86-202`, `PE/EngineExecutionListener.java:52-162`). They are optional callbacks with no algorithm calling them in order. The order is set by whoever *raises* the events (`NodeTestTask`, covered in area B).
- **`TestReporter`.** `publishEntry(String key, String value)` (`JA/TestReporter.java:68-72`) just wraps its arguments in a map and calls the abstract `publishEntry(Map)` (line 58). That is a convenience overload that funnels into one primitive, not a multi-step algorithm.
- **`TestExecutionSummary.printFailuresTo(writer, maxLines)`.** The default (`PL/listeners/TestExecutionSummary.java:155-156`) simply delegates to `printFailuresTo(writer)`. It is again an overload, not a skeleton.

`SummaryGeneratingListener`, `LoggingListener` and the rest are concrete classes with no subclass hooks.

---

## 5. Adapter: Confirmed for `DefaultTestReporter`; uncertain for the JFR and logging listeners

### 5a. `DefaultTestReporter`: confirmed (new; not counted before)

Test code uses the simple `TestReporter` API. Underneath, publishing goes through `ExtensionContext.publishReportEntry`, which turns the map into a `ReportEntry` and pushes it into the engine listener chain. `DefaultTestReporter` implements the first interface by calling the second.

| Role | Class |
|---|---|
| Target (what tests call) | `TestReporter` (`JA/TestReporter.java:47`) |
| Adaptee | `ExtensionContext.publishReportEntry(Map)` (implemented in `AbstractExtensionContext`) |
| Adapter | `DefaultTestReporter` |
| Client | the user's test method (receives it via `TestReporterParameterResolver`) |

```java
// JE/extension/DefaultTestReporter.java
24:  class DefaultTestReporter implements TestReporter {
…
33:      public void publishEntry(Map<String, String> map) {
34:          this.extensionContext.publishReportEntry(map);

// JE/descriptor/AbstractExtensionContext.java  (where the adaptee feeds the event chain)
141:     public void publishReportEntry(Map<String, String> values) {
142:         this.engineExecutionListener.reportingEntryPublished(this.testDescriptor, ReportEntry.from(values));
```

### 5b. `FlightRecordingExecutionListener` and `LoggingListener`: uncertain
Both translate JUnit events into a different API: JFR `Event` objects (`PL/jfr/FlightRecordingExecutionListener.java:80-99`) or `java.util.logging` (`LoggingListener.java:62-65`). Some textbooks call these adapters. In GoF terms, though, they don't make an existing class usable through an interface a client expects. They *are* clients of JFR or logging that happen to be observers. I'd count them as concrete observers (section 1), and mention the adapter reading only as a possible interpretation.

---

## 6. Decorator: Confirmed (strong, extra)

`StreamInterceptor` is a new class, not one of the area B engine-listener wrappers. It wraps the real `System.out` / `System.err` in a `PrintStream` subclass. Every `write` is copied into a per-thread buffer **and** passed on to the original stream, so output still appears on the console. This is the classic `java.io` filter-stream Decorator.

| Role | Class |
|---|---|
| Component | `java.io.PrintStream` |
| Concrete component | the original `System.out` / `System.err` |
| Decorator | `StreamInterceptor` |
| Installed / removed by | `StreamInterceptingTestExecutionListener.create(...)` / `unregister()` |

```java
// PL/core/StreamInterceptor.java
27:  class StreamInterceptor extends PrintStream {
…
31:      private final PrintStream originalStream;
…
51:          StreamInterceptor interceptor = new StreamInterceptor(originalStream, streamSetter, maxNumberOfBytesPerThread);
52:          streamSetter.accept(interceptor);
…
58:          super(originalStream);
…
84:      public void write(int b) {
85:          RewindableByteArrayOutputStream out = getOutput();
86:          if (out != null && out.size() < maxNumberOfBytesPerThread) {
…
88:              out.write(b);
89:          }
90:          super.write(b);
```

The listener then turns the captured text into a report event, so stdout ends up in reports. In `PL/core/StreamInterceptingTestExecutionListener.java`:
```java
85:      public void executionJustFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
…
87:          String out = stdoutInterceptor.map(StreamInterceptor::consume).orElse("");
…
96:              reporter.accept(testIdentifier, ReportEntry.from(map));
```
`reporter` is `testExecutionListener::reportingEntryPublished` (`EngineExecutionOrchestrator.java:164-165`).

---

## 7. Null Object: Confirmed (small, extra)

```java
// PE/EngineExecutionListener.java
39:      EngineExecutionListener NOOP = new EngineExecutionListener() {
40:      };

// PL/LauncherSessionListener.java
48:      LauncherSessionListener NOOP = new LauncherSessionListener() {
49:      };

// PL/listeners/session/LauncherSessionListeners.java
36:          if (listeners.isEmpty()) {
37:              return LauncherSessionListener.NOOP;
38:          }
39:          if (listeners.size() == 1) {
40:              return listeners.get(0);
41:          }
42:          return new CompositeLauncherSessionListener(listeners);
```

Because every listener method has an empty default, the NOOP objects are simply empty anonymous classes. `EngineExecutionOrchestrator` passes `EngineExecutionListener.NOOP` as the "parent" listener in a normal run (`EngineExecutionOrchestrator.java:66`), as seen in area B.

---

## 8. Classes that look like a pattern but don't follow it

| Class | Looks like | What it really is |
|---|---|---|
| `CompositeTestExecutionListener`, `CompositeEngineExecutionListener`, `CompositeLauncherSessionListener` | GoF Composite | Flat **multicasters** for Observer (section 2). There are no part-whole trees; children are always leaf listeners. |
| `ListenerRegistry` (`PL/core/ListenerRegistry.java:27`) | Registry / Service Locator (a global lookup) | A small, non-global **list builder**. It collects listeners and produces one composite. It is copied per run (`copyOf`, line 51), and nobody looks objects up in it by key. |
| `LauncherListenerRegistry` (`PL/core/LauncherListenerRegistry.java:16-19`) | Registry | Just a holder with two fields (discovery listeners, execution listeners) owned by one `DefaultLauncher`. |
| `MutableTestExecutionSummary` | Builder | No separate build step or product. `SummaryGeneratingListener` increments its package-private `AtomicLong` fields directly (lines 48-60), and callers read the same object through the read-only `TestExecutionSummary` interface. This is a **read-only interface over a mutable implementation**. The listener filling it in is closer to the *Collecting Parameter* idiom than to Builder. |
| `TestExecutionListener` (all-default methods) | An "adapter class" (like AWT's `MouseAdapter`) or Template Method hooks | A plain **observer interface** whose callbacks are optional, thanks to Java default methods. There is no skeleton and no interface conversion. |
| `StreamInterceptingTestExecutionListener` | Interceptor pattern | A concrete **observer** (an eager one) that switches capture on and off around each test. The wrapping is done by `StreamInterceptor` (the Decorator in section 6). "Intercepting" describes stream capture, not around-advice on calls. |
| `ReportEntry` (`PE/reporting/ReportEntry.java:34`) | Builder (`from(...)` static methods) | An immutable-from-outside **value object** with **static factory methods** (`from(Map)`, `from(key, value)`, lines 49-68). There is no step-by-step builder. |
| `LoggingListener.forJavaUtilLogging` / `forBiConsumer` | GoF Factory Method | **Static factory methods** around a private constructor (line 88). No subclass decides anything. The variability is the injected sink (Strategy, section 3b). |
| `FlightRecordingExecutionListener` | Adapter | A concrete **observer** that writes JFR events. The adapter reading is possible but weak (section 5b). |
| `UniqueIdTrackingListener` | State pattern (it switches itself on in `testPlanExecutionStarted`, line 147) | A concrete **observer** with a simple `enabled` flag read from configuration. There are no state objects or transitions. |

---

## How the patterns fit together in one run

1. Listeners are attached explicitly, through `ServiceLoader`, or per request, and collected in a `ListenerRegistry` whose composite factory is plugged in (**Strategy**, **Observer** attach).
2. `ListenerRegistry.getCompositeListener()` freezes them into a `CompositeTestExecutionListener` (a **multicaster**, Composite in shape only).
3. If capture is enabled, `StreamInterceptor` replaces `System.out` (**Decorator**), and `StreamInterceptingTestExecutionListener` joins as an eager observer.
4. A test calls `TestReporter.publishEntry`, which `DefaultTestReporter` turns into an `ExtensionContext` call (**Adapter**). That produces a `ReportEntry` event.
5. Each event is sent to every observer in bracket order, with priority observers first, using `IterationOrder` (**Strategy**). Failures in one observer are logged and don't affect the rest (**Observer** notify).
6. `SummaryGeneratingListener` fills a `MutableTestExecutionSummary`. `LoggingListener` logs through its sink, `UniqueIdTrackingListener` writes its file at the end, and `FlightRecordingExecutionListener` commits JFR events. Session open and close go to `LauncherSessionListener`s, with `NOOP` when none are registered (**Null Object**).
