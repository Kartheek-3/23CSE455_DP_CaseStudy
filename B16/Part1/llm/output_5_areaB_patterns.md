<!-- Raw output of Part 1, prompt 5 (Part1/llm/prompt_5_areaB_patterns.txt), same Claude chat.
     Copied verbatim: section 1 = chat reply, section 2 = attached file area-b-design-patterns.md. -->

# 1. Chat reply

Got it: a pattern analysis of area B with verdicts and code evidence. I'll start by reading the engine and executor classes.

The area B analysis is in [area-b-design-patterns.md](/mnt/project-files/junit-case-study/area-b-design-patterns.md). It has file paths, line numbers and snippets from commit f59f60d for every claim.

- **Template Method: confirmed.** `HierarchicalTestEngine.execute()` is `final` and fixes the run order; `JupiterTestEngine` only fills in the steps. `NodeTestTask` + `Node` has the same shape, but the steps live in a separate object, so I call it a hook interface rather than pure GoF.
- **Factory Method: confirmed (strong).** `createExecutorService`, `createExecutionContext` and `createThrowableCollectorFactory` are overridden by `JupiterTestEngine` to pick the concrete objects.
- **Strategy: confirmed, twice.** The three `HierarchicalTestExecutorService` implementations are swappable behind `submit`/`invokeAll`. `ParallelExecutionConfigurationStrategy` is written as an enum with FIXED, DYNAMIC and CUSTOM.
- **Decorator: confirmed (strong).** `DelegatingLauncher` → `InterceptingLauncher` wraps `DefaultLauncher`. `EngineExecutionOrchestrator` stacks the stack-trace-pruning, outcome-delaying and memory-cleanup listener wrappers.
- **Adapter: confirmed.** `ExecutionListenerAdapter` turns engine `TestDescriptor` events into client `TestIdentifier` events.
- **Observer: confirmed, new role.** `NodeTestTask` pushes execution events to `EngineExecutionListener`. Area A only covered the discovery listeners.
- **Composite: reused, new role.** It's the same tree, but `NodeTestTask` builds a matching tree of tasks to run it.
- **Extras:** Command (`NodeTestTask` as a `TestTask` handed to the executor) and a small Null Object (`NodeUtils.asNode`).

Some names point to patterns the classes don't actually follow:
- `ParallelHierarchicalTestExecutorServiceFactory` is a static factory, not GoF Factory Method.
- `TestEngine` is a plug-in interface, not a Strategy, because every engine runs.
- `ClosedLauncher` throws on every call, so it isn't a Null Object.
- `EngineExecutionOrchestrator` is a controller, not a Mediator.
- `LauncherStoreFacade` isn't really a Facade.

# 2. Attached file: area-b-design-patterns.md

# Area B: design patterns in test engines and the execution lifecycle

JUnit 6.1.3, commit `f59f60d2cebdf2224235d81f781b1f310cbc8138`. Every line number and snippet below was read from that commit. Snippets are trimmed; `…` marks omitted lines.

Path prefixes used below:
- `PE` = `junit-platform-engine/src/main/java/org/junit/platform/engine`
- `PH` = `junit-platform-engine/src/main/java/org/junit/platform/engine/support/hierarchical`
- `PL` = `junit-platform-launcher/src/main/java/org/junit/platform/launcher`
- `JE` = `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine`

## Verdicts at a glance

| Pattern | Verdict | Main classes | One-line reason |
|---|---|---|---|
| Template Method | **Confirmed** | `HierarchicalTestEngine.execute()` | A `final` method fixes the run sequence; subclasses fill in the steps. |
| Factory Method | **Confirmed** (strong) | `HierarchicalTestEngine.createExecutorService / createExecutionContext / createThrowableCollectorFactory`, overridden by `JupiterTestEngine` | The superclass algorithm asks overridable methods which concrete objects to create. |
| Strategy | **Confirmed** | `HierarchicalTestExecutorService` (SameThread / ForkJoinPool / WorkerThreadPool); `ParallelExecutionConfigurationStrategy` (FIXED / DYNAMIC / CUSTOM) | Interchangeable algorithms behind one interface, chosen by configuration. |
| Decorator | **Confirmed** (strong) | `DelegatingLauncher` → `InterceptingLauncher`; `DelegatingEngineExecutionListener` → `StackTracePruning…`, `OutcomeDelaying…`, `MemoryCleanupListener` | Wrappers implement the same interface as the object they wrap and add behaviour around the forwarded call. |
| Adapter | **Confirmed** | `ExecutionListenerAdapter` | Converts engine-side `EngineExecutionListener` calls into client-side `TestExecutionListener` calls. |
| Observer | **Confirmed, new role** | `NodeTestTask` → `EngineExecutionListener` | Execution events are pushed to a listener the engine doesn't know concretely. Area A covered the discovery listeners; these are different classes. Area C goes deeper. |
| Composite | **Reused, new role** | `NodeTestTask` walking the `TestDescriptor` tree | Same tree as area A, but here a parallel tree of tasks executes it. |
| Command (extra) | **Confirmed** | `NodeTestTask implements TestTask` | Each node's work is packaged as an object with `execute()` and handed to an executor service. |

Section 9 covers classes whose names suggest a pattern they don't actually follow.

---

## 1. Template Method: Confirmed

### How it is used
`HierarchicalTestEngine` defines the whole run of an engine in one `final` method. The order is always the same: create an executor service, create a root context, create an error-collector factory, build a `HierarchicalTestExecutor`, run it, and close the executor. Subclasses can't change that order. They only supply the pieces.

### Roles

| Role | Class / method |
|---|---|
| Abstract class | `HierarchicalTestEngine<C>` |
| Template method | `execute(ExecutionRequest)`, `final` |
| Primitive operation (abstract) | `createExecutionContext(ExecutionRequest)` |
| Hooks (default provided) | `createExecutorService(...)`, `createThrowableCollectorFactory(...)` |
| Concrete class | `JupiterTestEngine` |

### Evidence

`PH/HierarchicalTestEngine.java`:
```java
31:  public abstract class HierarchicalTestEngine<C extends EngineExecutionContext> implements TestEngine {
…
52:      @Override
53:      public final void execute(ExecutionRequest request) {
54:          try (HierarchicalTestExecutorService executorService = createExecutorService(request)) {
55:              C executionContext = createExecutionContext(request);
56:              ThrowableCollector.Factory throwableCollectorFactory = createThrowableCollectorFactory(request);
57:              new HierarchicalTestExecutor<>(request, executionContext, executorService,
58:                  throwableCollectorFactory).execute().get();
59:          }
…
117:     protected abstract C createExecutionContext(ExecutionRequest request);
```

`JE/JupiterTestEngine.java` fills in the steps and does **not** override `execute`:
```java
44:  public final class JupiterTestEngine extends HierarchicalTestEngine<JupiterEngineExecutionContext> {
…
90:      protected JupiterEngineExecutionContext createExecutionContext(ExecutionRequest request) {
91:          return new JupiterEngineExecutionContext(request.getEngineExecutionListener(), getJupiterConfiguration(request),
```

### A related case: `NodeTestTask` + `Node` (Template Method in shape, built with composition)
`NodeTestTask.execute()` is also a fixed skeleton (`prepare → shouldBeSkipped → before → execute → children → after → cleanUp → report`). It calls steps on a `Node`, and `Node`'s default methods are empty hooks:

```java
// PH/NodeTestTask.java
106:     public void execute() {
…
110:                 prepare();
113:                 throwableCollector.execute(() -> skipResult = checkWhetherSkipped());
116:                 executeRecursively();
119:                 cleanUp();
121:             reportCompletion();

// PH/Node.java
38:  public interface Node<C extends EngineExecutionContext> {
47:      default C prepare(C context) throws Exception {
69:      default SkipResult shouldBeSkipped(C context) throws Exception {
87:      default C before(C context) throws Exception {
125:     default void after(C context) throws Exception {
```

Textbook Template Method puts the skeleton and the steps in the same inheritance hierarchy. Here the skeleton lives in `NodeTestTask` and calls a separate `Node` object (a `TestDescriptor` such as `TestMethodTestDescriptor`). It has the intent of Template Method (fixed order, overridable steps) but is built by **delegation**, so it is a "hook interface" rather than a classic Template Method. I'd describe it that way rather than call it a pure GoF Template Method.

---

## 2. Factory Method: Confirmed (strong)

### How it is used
The template method above needs three objects but doesn't hard-code which classes to use. It calls three `create…` methods, and `JupiterTestEngine` overrides all of them to supply Jupiter's choices. This is the GoF Factory Method: "define an interface for creating an object, but let subclasses decide which class to instantiate."

### Roles

| Role | Class / method |
|---|---|
| Creator | `HierarchicalTestEngine` |
| Factory methods | `createExecutorService`, `createExecutionContext`, `createThrowableCollectorFactory` |
| Concrete creator | `JupiterTestEngine` |
| Products | `HierarchicalTestExecutorService`, `EngineExecutionContext` (`JupiterEngineExecutionContext`), `ThrowableCollector.Factory` |

### Evidence

`PH/HierarchicalTestEngine.java` provides the defaults:
```java
83:      protected HierarchicalTestExecutorService createExecutorService(ExecutionRequest request) {
84:          return new SameThreadHierarchicalTestExecutorService();
85:      }
…
106:     protected ThrowableCollector.Factory createThrowableCollectorFactory(ExecutionRequest request) {
107:         return OpenTest4JAwareThrowableCollector::new;
108:     }
```

`JE/JupiterTestEngine.java` provides the overrides:
```java
80:      protected HierarchicalTestExecutorService createExecutorService(ExecutionRequest request) {
82:          if (configuration.isParallelExecutionEnabled()) {
83:              return ParallelHierarchicalTestExecutorServiceFactory.create(new PrefixedConfigurationParameters(
…
86:          return super.createExecutorService(request);
…
99:      protected ThrowableCollector.Factory createThrowableCollectorFactory(ExecutionRequest request) {
100:         return JupiterThrowableCollectorFactory::createThrowableCollector;
```

Note that `createThrowableCollectorFactory` returns a factory (`ThrowableCollector.Factory`, `PH/ThrowableCollector.java:209`). That factory is called once per node to make a fresh collector, so it is a factory method that produces a factory object.

---

## 3. Strategy: Confirmed (two separate uses)

### 3a. `HierarchicalTestExecutorService`: how tasks are run

How tasks run (one thread, a fork-join pool, or a worker pool) is swappable behind one interface. `NodeTestTask` and `HierarchicalTestExecutor` only ever call `submit` and `invokeAll`.

| Role | Class |
|---|---|
| Strategy interface | `HierarchicalTestExecutorService` |
| Concrete strategies | `SameThreadHierarchicalTestExecutorService`, `ForkJoinPoolHierarchicalTestExecutorService`, `WorkerThreadPoolHierarchicalTestExecutorService` |
| Context | `HierarchicalTestExecutor`, `NodeTestTask` |
| Selection | `JupiterTestEngine.createExecutorService` → `ParallelHierarchicalTestExecutorServiceFactory.create` |

```java
// PH/HierarchicalTestExecutorService.java
34:  public interface HierarchicalTestExecutorService extends AutoCloseable {
55:      Future<@Nullable Void> submit(TestTask testTask);
74:      void invokeAll(List<? extends TestTask> testTasks);

// PH/SameThreadHierarchicalTestExecutorService.java
29:  public class SameThreadHierarchicalTestExecutorService implements HierarchicalTestExecutorService {
35:      public Future<@Nullable Void> submit(TestTask testTask) {
36:          testTask.execute();
37:          return completedFuture(null);
…
41:      public void invokeAll(List<? extends TestTask> tasks) {
42:          tasks.forEach(TestTask::execute);

// PH/ForkJoinPoolHierarchicalTestExecutorService.java
51:  public class ForkJoinPoolHierarchicalTestExecutorService implements HierarchicalTestExecutorService {
…
144:     public void invokeAll(List<? extends TestTask> tasks) {
…
152:         forkConcurrentTasks(tasks, isolatedTasks, sameThreadTasks, concurrentTasksInReverseOrder);
153:         executeSync(sameThreadTasks);
154:         joinConcurrentTasksInReverseOrderToEnableWorkStealing(concurrentTasksInReverseOrder);
155:         executeSync(isolatedTasks);

// PH/WorkerThreadPoolHierarchicalTestExecutorService.java
70:  public final class WorkerThreadPoolHierarchicalTestExecutorService implements HierarchicalTestExecutorService {
150:     public Future<@Nullable Void> submit(TestTask testTask) {
175:     public void invokeAll(List<? extends TestTask> testTasks) {
```

The context never checks which strategy it has. In `PH/NodeTestTask.java`:
```java
180:                         taskContext.executorService().invokeAll(children);
```

### 3b. `ParallelExecutionConfigurationStrategy`: how parallelism is computed

| Role | Class |
|---|---|
| Strategy interface | `ParallelExecutionConfigurationStrategy` |
| Concrete strategies | enum constants `FIXED`, `DYNAMIC`, `CUSTOM` in `DefaultParallelExecutionConfigurationStrategy`; `CUSTOM` loads a user class |
| Selection | `DefaultParallelExecutionConfigurationStrategy.getStrategy(...)`, from the `strategy` config key (default `dynamic`) |
| Context | `ParallelHierarchicalTestExecutorServiceFactory.create(...)` |

```java
// PH/ParallelExecutionConfigurationStrategy.java
25:  public interface ParallelExecutionConfigurationStrategy {
31:      ParallelExecutionConfiguration createConfiguration(ConfigurationParameters configurationParameters);

// PH/DefaultParallelExecutionConfigurationStrategy.java
33:  public enum DefaultParallelExecutionConfigurationStrategy implements ParallelExecutionConfigurationStrategy {
39:      FIXED {
41:          public ParallelExecutionConfiguration createConfiguration(ConfigurationParameters configurationParameters) {
42:              int parallelism = configurationParameters.get(CONFIG_FIXED_PARALLELISM_PROPERTY_NAME,
…
63:      DYNAMIC {
…
73:              int parallelism = Math.max(1,
74:                  factor.multiply(BigDecimal.valueOf(Runtime.getRuntime().availableProcessors())).intValue());
…
97:      CUSTOM {
…
108:                         return (ParallelExecutionConfigurationStrategy) ReflectionSupport.newInstance(strategyClass);
…
219:     static ParallelExecutionConfiguration toConfiguration(ConfigurationParameters configurationParameters) {
220:         return getStrategy(configurationParameters).createConfiguration(configurationParameters);
…
223:     static ParallelExecutionConfigurationStrategy getStrategy(ConfigurationParameters configurationParameters) {
224:         return valueOf(
225:             configurationParameters.get(CONFIG_STRATEGY_PROPERTY_NAME).orElse("dynamic").toUpperCase(Locale.ROOT));
```

This is the "enum strategy" idiom: each enum constant overrides the interface method. Its only output is a configuration object, so it is also a factory. Strategy is still the right label, because the point is choosing between interchangeable algorithms (fixed count, CPU-based, or user-defined).

---

## 4. Decorator: Confirmed (strong, two chains)

### 4a. Launcher decorators

| Role | Class |
|---|---|
| Component | `Launcher` (interface, `PL/Launcher.java:53`) |
| Concrete component | `DefaultLauncher` |
| Base decorator | `DelegatingLauncher` (holds a `Launcher`, forwards every call) |
| Concrete decorator | `InterceptingLauncher` (wraps each call in a `LauncherInterceptor`) |
| Assembled in | `DefaultLauncherSession` constructor |

```java
// PL/core/DelegatingLauncher.java
24:  class DelegatingLauncher implements Launcher {
26:      protected Launcher delegate;
…
53:      public void execute(LauncherDiscoveryRequest discoveryRequest, TestExecutionListener... listeners) {
…
57:          delegate.execute(discoveryRequest, listeners);

// PL/core/InterceptingLauncher.java
25:  class InterceptingLauncher extends DelegatingLauncher {
27:      private final LauncherInterceptor interceptor;
…
63:      public void execute(LauncherExecutionRequest executionRequest) {
65:          interceptor.<@Nullable Object> intercept(() -> {
66:              super.execute(executionRequest);
67:              return null;
68:          });

// PL/core/DefaultLauncherSession.java  (stacking the decorators)
67:              launcher = new InterceptingLauncher(interceptor.intercept(() -> launcherFactory.apply(this.store)),
68:                  interceptor);
69:          }
70:          this.launcher = new DelegatingLauncher(launcher);
```

So the session's launcher is `DelegatingLauncher → InterceptingLauncher → DefaultLauncher`.

Several `LauncherInterceptor`s are also merged into one by nesting each inside the previous (`DefaultLauncherSession.java:136-155`): `return a.intercept(() -> b.intercept(invocation));` (line 155). That is a **chain of interceptors**, the same idea as Chain of Responsibility / around-advice.

### 4b. Engine-listener decorators built by `EngineExecutionOrchestrator`

| Role | Class |
|---|---|
| Component | `EngineExecutionListener` (`PE/EngineExecutionListener.java`) |
| Base decorator | `DelegatingEngineExecutionListener` |
| Concrete decorators | `StackTracePruningEngineExecutionListener`, `OutcomeDelayingEngineExecutionListener`, `MemoryCleanupListener` |
| Assembler | `EngineExecutionOrchestrator` |

```java
// PL/core/DelegatingEngineExecutionListener.java
22:  class DelegatingEngineExecutionListener implements EngineExecutionListener {
24:      private final EngineExecutionListener delegate;

// PL/core/StackTracePruningEngineExecutionListener.java
31:  class StackTracePruningEngineExecutionListener extends DelegatingEngineExecutionListener {
…
38:      public void executionFinished(TestDescriptor testDescriptor, TestExecutionResult testExecutionResult) {
…
43:              ExceptionUtils.findNestedThrowables(throwable).forEach(
44:                  t -> ExceptionUtils.pruneStackTrace(t, testClassNames));
…
46:          super.executionFinished(testDescriptor, testExecutionResult);

// PL/core/EngineExecutionOrchestrator.java  (stacking them, each conditionally)
148:         if (isMemoryCleanupEnabled(testPlan)) {
149:             listener = new MemoryCleanupListener(listener, testPlan);
…
197:         if (stackTracePruningEnabled) {
198:             return new StackTracePruningEngineExecutionListener(engineExecutionListener);
…
253:         OutcomeDelayingEngineExecutionListener delayingListener = new OutcomeDelayingEngineExecutionListener(listener,
254:             engineDescriptor);
```

Each decorator adds one behaviour and is switched on independently. That is the main advantage of Decorator over subclassing, where every combination would need its own subclass.

---

## 5. Adapter: Confirmed

### How it is used
Engines report in terms of `TestDescriptor` (engine world). IDEs and build tools listen in terms of `TestIdentifier` (client world). `ExecutionListenerAdapter` implements the engine-side interface and forwards to the client-side one, translating each argument.

| Role | Class |
|---|---|
| Target (what the engine calls) | `EngineExecutionListener` |
| Adaptee (what the client implements) | `TestExecutionListener` |
| Adapter | `ExecutionListenerAdapter` |
| Client | the engine, through `NodeTestTask` |
| Wired in | `EngineExecutionOrchestrator.buildEngineExecutionListener` |

```java
// PL/core/ExecutionListenerAdapter.java
28:  class ExecutionListenerAdapter implements EngineExecutionListener {
30:      private final TestPlan testPlan;
31:      private final TestExecutionListener testExecutionListener;
…
46:      public void executionStarted(TestDescriptor testDescriptor) {
47:          this.testExecutionListener.executionStarted(getTestIdentifier(testDescriptor));
…
70:      private TestIdentifier getTestIdentifier(TestDescriptor testDescriptor) {
71:          return this.testPlan.getTestIdentifier(testDescriptor.getUniqueId());

// PL/core/EngineExecutionOrchestrator.java
145:         registry.add(new ExecutionListenerAdapter(testPlan, testExecutionListener));
```

Unlike the decorators in section 4, this class implements a **different** interface from the one it wraps. That is exactly what separates Adapter from Decorator.

---

## 6. Observer: Confirmed, in a new role

Area A covered Observer for **discovery** (`LauncherDiscoveryListener`). In area B, different classes play the roles, for **execution** events:

| Role | Class |
|---|---|
| Subject (raises events) | `NodeTestTask` |
| Observer interface | `EngineExecutionListener` |
| Observer passed in | the listener inside `ExecutionRequest`, i.e. the decorator chain from section 4b, ending in `ExecutionListenerAdapter` and a `CompositeEngineExecutionListener` |

```java
// PH/NodeTestTask.java
158:         taskContext.listener().executionStarted(testDescriptor);
…
209:             taskContext.listener().executionSkipped(testDescriptor, skipResult.getReason().orElse("<unknown>"));
…
224:         taskContext.listener().executionFinished(testDescriptor, throwableCollector.toTestExecutionResult());
```

The orchestrator also notifies plan-level observers (`PL/core/EngineExecutionOrchestrator.java:104` `testPlanExecutionStarted`, `:113` `testPlanExecutionFinished`).

As in area A, this is a push-style listener: there is no `attach`/`detach` on the subject. The full listener side (composite listeners, summary and logging listeners) is area C, so I've kept this short.

---

## 7. Composite: reused, with a new role

The tree is the same `TestDescriptor` Composite from area A. What's new in B is **who walks it**. Execution doesn't use `TestDescriptor.accept`. Instead, `NodeTestTask` builds one task per child and hands them to the executor, so a tree of tasks mirrors the descriptor tree while it runs:

```java
// PH/NodeTestTask.java
76:          this.node = NodeUtils.asNode(testDescriptor);
…
169:                             .map(descriptor -> new NodeTestTask<C>(taskContext, descriptor))
…
180:                         taskContext.executorService().invokeAll(children);
```

A container's result depends on its children because the container task only reports finished after `invokeAll(children)` returns. That is the Composite idea of "the whole is processed by processing its parts", now applied to execution.

---

## 8. Extra patterns with strong evidence

### Command: Confirmed
`NodeTestTask` packages the work for one node as an object with `execute()`, plus metadata (`getExecutionMode`, `getResourceLock`). The executor service is the invoker: it decides when and on which thread to call `execute()`, without knowing what the work is.

```java
// PH/HierarchicalTestExecutorService.java
88:      interface TestTask {
93:          ExecutionMode getExecutionMode();
98:          ResourceLock getResourceLock();
114:         void execute();

// PH/NodeTestTask.java
46:  class NodeTestTask<C extends EngineExecutionContext> implements TestTask {

// PH/ForkJoinPoolHierarchicalTestExecutorService.java   (invoker)
210:     class ExclusiveTask extends ForkJoinTask<@Nullable Void> {
…
266:                 testTask.execute();
```

### Null Object: Confirmed (small)
A `TestDescriptor` that isn't a `Node` gets a do-nothing `Node`, so `NodeTestTask` never needs null checks:

```java
// PH/NodeUtils.java
25:      static <C extends EngineExecutionContext> Node<C> asNode(TestDescriptor testDescriptor) {
26:          return (testDescriptor instanceof Node node ? node : noOpNode);
…
30:      private static final Node noOpNode = new Node() {
```

---

## 9. Classes that look like a pattern but don't follow it

| Class | Looks like | What it really is |
|---|---|---|
| `ParallelHierarchicalTestExecutorServiceFactory` (`PH/…Factory.java:33`) | GoF Factory Method or Abstract Factory | A **static ("simple") factory**: a `final` class with a private constructor (line 93) and a `switch` over an enum (lines 86-90). No subclass decides anything, and there is no family of related products. The real Factory Method is `HierarchicalTestEngine.createExecutorService` (section 2), which *calls* this helper. |
| `TestEngine` (`PE/TestEngine.java:49`) | Strategy (one interface, many implementations) | A **plug-in / Service Provider Interface**. The launcher doesn't pick one engine as a strategy; it runs **every** discovered engine in turn (`EngineExecutionOrchestrator.java:188`, `for (TestEngine testEngine : …)`). Engines are found with `ServiceLoader`, not chosen by the caller. |
| `HierarchicalTestExecutor` (`PH/HierarchicalTestExecutor.java:36`) | The executor strategy, or a Facade | A small one-shot **coordinator**. It builds the root `NodeTestTask` and its shared context (lines 55-69) and submits it (line 52). The swappable execution behaviour lives in `HierarchicalTestExecutorService`, not here. |
| `DelegatingLauncher` (`PL/core/DelegatingLauncher.java:24`) | Decorator (on its own) | On its own it adds **no** behaviour; it only forwards. It is the base for `InterceptingLauncher`. In `DefaultLauncherSession` its role is a **swappable handle**: on `close()` its delegate is replaced with `ClosedLauncher.INSTANCE` (`DefaultLauncherSession.java:85-86`), so later calls fail. That use is closer to a protection **Proxy** than a Decorator. |
| `ClosedLauncher` (`DefaultLauncherSession.java:98`) | Null Object | Every method **throws** `PreconditionViolationException` (lines 107-132). A Null Object quietly does nothing; this is a **fail-fast sentinel** for a closed session. |
| `InterceptingLauncher` | Interceptor / Proxy | A **Decorator** (section 4a). The interception logic is in the `LauncherInterceptor` objects it calls, which are chained together. |
| `EngineExecutionOrchestrator` | Mediator | A **controller** that drives a fixed sequence (start plan, build listeners, run each engine, finish plan). The objects it uses don't talk to each other through it, which is what Mediator would require. It also assembles the decorator chain (section 4b). |
| `LauncherStoreFacade` (`JE/execution/LauncherStoreFacade.java:23`) | Facade | It doesn't simplify a complex subsystem. It holds two store references and converts Jupiter namespaces into platform ones, creating a `NamespaceAwareStore` for each lookup (lines 46-55). It acts more like an **adapter factory** for stores than a Facade. |
| `DefaultParallelExecutionConfigurationStrategy` | — | A real Strategy (section 3b), written as an enum. The name is accurate. |

---

## How the patterns fit together in one run

1. `DefaultLauncherSession` wraps `DefaultLauncher` in `InterceptingLauncher` and `DelegatingLauncher` (**Decorator**, plus a chain of interceptors).
2. `EngineExecutionOrchestrator` wraps the client's `TestExecutionListener` in `ExecutionListenerAdapter` (**Adapter**), then stacks pruning, outcome-delaying and memory-cleanup wrappers on top (**Decorator**). It calls `TestEngine.execute` on every engine (**plug-in SPI**).
3. `HierarchicalTestEngine.execute()` runs a fixed sequence (**Template Method**) and gets its executor, context and collector factory from overridable `create…` methods (**Factory Method**) that `JupiterTestEngine` overrides.
4. The executor service is SameThread, ForkJoinPool or WorkerThreadPool (**Strategy**). Parallelism is computed by FIXED, DYNAMIC or CUSTOM (**Strategy**).
5. Each node becomes a `NodeTestTask` (**Command**) that runs the `Node` steps in a fixed order (a Template Method shape, built by delegation), creates child tasks for the subtree (**Composite**, new role), and pushes started, skipped and finished events to the listener chain (**Observer**).
