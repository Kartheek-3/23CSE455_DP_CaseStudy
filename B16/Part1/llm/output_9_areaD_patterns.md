<!-- Raw output of Part 1, prompt 9 (Part1/llm/prompt_9_areaD_patterns.txt), same Claude chat.
     Copied verbatim: section 1 = chat reply, section 2 = attached file area-d-design-patterns.md. -->

# 1. Chat reply

Got it: a pattern analysis of area D, skipping what A to C already counted. I'll read the extension classes first.

The area D pattern analysis is ready: [area-d-design-patterns.md](/mnt/project-files/junit-case-study/area-d-design-patterns.md). Each pattern has its roles, paths, line numbers, snippets and a verdict, and I rechecked the lines against commit f59f60d.

- **Strategy: confirmed, and the strongest in the case study.** `TempDirFactory` and `TempDirDeletionStrategy` are picked from `@TempDir` or the configuration. A `ParameterResolver` is chosen by `supportsParameter`, with exactly one allowed to match. `ExecutionCondition`s are combined by `ConditionEvaluator`, where the first "disabled" wins. The store also takes an injected `CloseAction`.
- **Adapter: confirmed twice.** `NamespaceAwareStore` makes the platform store look like the Jupiter `Store` (its factory method is even called `getStoreAdapter`). `BeforeEachMethodAdapter` and `AfterEachMethodAdapter` turn plain `@BeforeEach`/`@AfterEach` methods into extensions.
- **Observer: confirmed for `TestWatcher`.** It only watches outcomes, and its errors are just logged. The other lifecycle callbacks are uncertain, because they can fail the test or inject fields, which makes them hooks more than observers.
- **Template Method: rejected.** `CallbackSupport` varies behaviour with a lambda rather than a subclass. The only real case is the one-step `AbstractExtensionContext.getExecutionMode()`, which I mention but don't count.
- **Composite: rejected.** The context, store and registry are parent chains with no children.
- **Three extras:**
  - **Chain of Responsibility:** `InvocationInterceptorChain`, in its interceptor-chain variant.
  - **Decorator, strong:** the timeout invocations wrap `Invocation`, and the method that builds them is literally named `decorate`.
  - **Command, small:** `MethodInvocation` packages a call so it can be run later or skipped.

The file ends with 13 look-alikes. Examples are `TempDirFactory` (not Factory Method), `CleanupMode` (just an enum flag, not Strategy) and `ConditionEvaluator` (not a chain).

# 2. Attached file: area-d-design-patterns.md

# Area D: design patterns in Jupiter extensions and resource management

JUnit 6.1.3, commit `f59f60d2cebdf2224235d81f781b1f310cbc8138`. Every line number and snippet below was read from that commit. Snippets are trimmed; `…` marks omitted lines.

Path prefixes:
- `JA` = `junit-jupiter-api/src/main/java/org/junit/jupiter/api`
- `JE` = `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine`
- `PS` = `junit-platform-engine/src/main/java/org/junit/platform/engine/support/store`

**Not counted again** (already covered in areas A to C): the `JupiterTestDescriptor` skeleton methods (`prepare`/`before`/`execute`/`after`/`cleanUp`), the `DefaultClassDescriptor` / `DefaultMethodDescriptor` wrappers, `DefaultTestReporter`, the `NOOP` listeners, and all listener classes. Where the lifecycle skeleton appears below, it is only to show *where* an extension is called, not as a new Template Method.

## Verdicts at a glance

| Pattern | Verdict | Main classes | One-line reason |
|---|---|---|---|
| Strategy | **Confirmed** (strong) | `TempDirFactory`, `TempDirDeletionStrategy`, `ParameterResolver`, `ExecutionCondition`, `NamespacedHierarchicalStore.CloseAction` | Interchangeable objects chosen by annotation, configuration or a `supports…` check, behind one interface. |
| Adapter | **Confirmed** (two clear cases) | `NamespaceAwareStore`; `BeforeEachMethodAdapter` / `AfterEachMethodAdapter` | One turns the platform store into the Jupiter `Store` API; the other turns a plain `@BeforeEach`/`@AfterEach` method into an `Extension`. |
| Observer | **Confirmed** for `TestWatcher`; **uncertain** for the other lifecycle callbacks | `TestWatcher`; `BeforeEachCallback`, `AfterEachCallback`, … | `TestWatcher` only observes outcomes. The other callbacks can change the run (fail it, inject fields), so they are extension hooks more than observers. |
| Template Method | **Rejected** (one tiny exception) | `CallbackSupport`, `TestWatcher`, `AbstractExtensionContext` | `CallbackSupport` varies behaviour with a lambda, not a subclass. Only `AbstractExtensionContext.getExecutionMode()` → `getPlatformExecutionMode()` has the shape, and it is a single step. |
| Composite | **Rejected** | `ExtensionContext`, `NamespacedHierarchicalStore`, `MutableExtensionRegistry` | They form parent chains, but no class holds children and treats one and many the same way. |
| Chain of Responsibility (extra) | **Confirmed** for `InvocationInterceptorChain`; **uncertain** for the store's parent lookup | `InvocationInterceptorChain`, `InvocationInterceptor`, `Invocation` | Each interceptor receives the call and decides whether to pass it on (`proceed()`), skip it, or wrap it. |
| Decorator (extra) | **Confirmed** (strong) | `SameThreadTimeoutInvocation`, `SeparateThreadTimeoutInvocation`, `ValidatingInvocation` | Each implements `Invocation`, holds another `Invocation`, and adds behaviour (timeout, call-once check) around `proceed()`. The method that builds them is literally called `decorate`. |
| Command (extra) | **Confirmed** (small) | `MethodInvocation`, `ConstructorInvocation` | A reflective call is packaged as an `Invocation` object with `proceed()`, so interceptors can pass it around, run it later, or skip it. |

Section 9 covers classes whose names suggest a pattern they don't really follow.

---

## 1. Strategy: Confirmed (strong)

Area D has the clearest Strategy uses in the case study. There are five, all new.

### 1a. `TempDirFactory`: how a temp directory is created

| Role | Class |
|---|---|
| Strategy | `TempDirFactory` (`JA/io/TempDirFactory.java:49`), method `createTempDirectory` (line 64) |
| Default concrete strategy | `TempDirFactory.Standard` (lines 83-95), which calls `Files.createTempDirectory("junit-")` |
| Custom concrete strategy | any class named in `@TempDir(factory = …)` |
| Context | `TempDirectory` → `CloseablePath` |

```java
// JA/io/TempDirFactory.java
49:  public interface TempDirFactory extends Closeable {
64:      Path createTempDirectory(AnnotatedElementContext elementContext, ExtensionContext extensionContext)
…
83:      class Standard implements TempDirFactory {
…
95:              return Files.createTempDirectory(TEMP_DIR_PREFIX);

// JE/extension/TempDirectory.java  (choosing the strategy)
194:     private TempDirFactory determineTempDirFactory(TempDir tempDir) {
195:         Class<? extends TempDirFactory> factory = tempDir.factory();
197:         return factory == TempDirFactory.class //
198:                 ? this.configuration.getDefaultTempDirFactorySupplier().get()
199:                 : ReflectionSupport.newInstance(factory);
```

### 1b. `TempDirDeletionStrategy`: how a temp directory is deleted

`JA/io/TempDirDeletionStrategy.java:71` (interface, method `delete` at line 89) has two built-in strategies, `IgnoreFailures` (line 97) and `Standard` (line 165). `TempDirectory.determineDeletionStrategy` (`TempDirectory.java:187-192`) picks one from `@TempDir(deletionStrategy = …)` or the configuration. `Cleanup.run` then calls `deletionStrategy.get().delete(...)` (line 349).

### 1c. `ParameterResolver`: who supplies a parameter value

| Role | Class |
|---|---|
| Strategy | `ParameterResolver` (`JA/extension/ParameterResolver.java:69`), with `supportsParameter` (88) and `resolveParameter` (113) |
| Concrete strategies | `TempDirectory`, `TestInfoParameterResolver`, `TestReporterParameterResolver`, user resolvers |
| Context | `ParameterResolutionUtils.resolveParameter` |

The context picks the strategy at run time by asking each one whether it supports the parameter. Exactly one must answer yes:
```java
// JE/execution/ParameterResolutionUtils.java
132:             List<ParameterResolver> matchingResolvers = extensionRegistry.stream(ParameterResolver.class)
133:                     .filter(resolver -> resolver.supportsParameter(parameterContext, extensionContext.get(resolver)))
134:                     .toList();
…
137:             if (matchingResolvers.isEmpty()) {
…
143:             if (matchingResolvers.size() > 1) {
…
154:             ParameterResolver resolver = matchingResolvers.get(0);
155:             Object value = resolver.resolveParameter(parameterContext, extensionContext.get(resolver));

// JE/extension/TempDirectory.java  (one concrete strategy)
156:     public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
157:         return parameterContext.isAnnotated(TempDir.class);
```

This is not Chain of Responsibility: the resolvers don't pass the request along, and more than one match is an error, not "first one wins".

### 1d. `ExecutionCondition`: deciding whether a test runs

`ExecutionCondition` (`JA/extension/ExecutionCondition.java:58`, method `evaluateExecutionCondition` at line 71) is a strategy with concrete strategies `DisabledCondition` (`JE/extension/DisabledCondition.java:31`) and the `@EnabledOn…`/`@DisabledIf…` conditions. `ConditionEvaluator` combines them with a fixed rule: the first one that says "disabled" wins.
```java
// JE/execution/ConditionEvaluator.java
52:          return extensionRegistry.stream(ExecutionCondition.class)
53:                  .filter(configuration.getExecutionConditionFilter())
54:                  .map(condition -> evaluate(condition, context))
55:                  .filter(ConditionEvaluationResult::isDisabled)
56:                  .findFirst()
57:                  .orElse(ENABLED);
```
It is called from `JupiterTestDescriptor.java:229` (the skip check counted in area B).

### 1e. `CloseAction`: what "closing a stored value" means

The platform store doesn't know how to close Jupiter values, so Jupiter injects a strategy for it:
```java
// PS/NamespacedHierarchicalStore.java
84:      public NamespacedHierarchicalStore(@Nullable NamespacedHierarchicalStore<N> parentStore,
85:              @Nullable CloseAction<N> closeAction) {
…
734:     public interface CloseAction<N> {

// JE/descriptor/AbstractExtensionContext.java
92:          this.valuesStore = new NamespacedHierarchicalStore<>(getParentStore(parent), createCloseAction());
…
108:             if (isAutoCloseEnabled && value instanceof @SuppressWarnings("resource") AutoCloseable closeable) {
109:                 closeable.close();
…
113:             if (value instanceof Store.CloseableResource resource) {
…
120:                 resource.close();
```

---

## 2. Adapter: Confirmed (two clear cases)

### 2a. `NamespaceAwareStore`: the Jupiter `Store` API on top of the platform store

Extensions use `ExtensionContext.Store`, which is per-namespace and throws `ExtensionContextException`. The real storage is the platform's `NamespacedHierarchicalStore`, which takes the namespace on every call and throws `NamespacedHierarchicalStoreException`. `NamespaceAwareStore` fixes the namespace, converts the namespace type, and translates the exception.

| Role | Class |
|---|---|
| Target | `ExtensionContext.Store` (`JA/extension/ExtensionContext.java:526`) |
| Adaptee | `NamespacedHierarchicalStore<Namespace>` (`PS/NamespacedHierarchicalStore.java:56`) |
| Adapter | `NamespaceAwareStore` (`JE/execution/NamespaceAwareStore.java:31`) |
| Created by | `LauncherStoreFacade.getStoreAdapter` (`JE/execution/LauncherStoreFacade.java:46-56`), called from `AbstractExtensionContext.getStore` (`:219-220`) |

```java
// JE/execution/NamespaceAwareStore.java
31:  public class NamespaceAwareStore implements Store {
33:      private final NamespacedHierarchicalStore<Namespace> valuesStore;
34:      private final Namespace namespace;
…
42:      public @Nullable Object get(Object key) {
…
44:          Supplier<@Nullable Object> action = () -> this.valuesStore.get(this.namespace, key);
45:          return this.<@Nullable Object> accessStore(action);
…
118:     private <T extends @Nullable Object> T accessStore(Supplier<T> action) {
…
122:         catch (NamespacedHierarchicalStoreException e) {
123:             throw new ExtensionContextException(e.getMessage(), e);

// JE/execution/LauncherStoreFacade.java  (namespace conversion)
46:      public NamespaceAwareStore getStoreAdapter(NamespacedHierarchicalStore<Namespace> valuesStore,
…
49:          return new NamespaceAwareStore(valuesStore, convert(namespace));
…
52:      private Namespace convert(ExtensionContext.Namespace namespace) {
```
The method is even named `getStoreAdapter`.

### 2b. `BeforeEachMethodAdapter` / `AfterEachMethodAdapter`: lifecycle methods treated as extensions

A user's `@BeforeEach` method is just a reflected `Method`. To run it through the same registry machinery as real extensions (ordering, `CallbackSupport`, exception handlers), Jupiter wraps it in an object that implements an `Extension` subtype.

| Role | Class |
|---|---|
| Target | `BeforeEachMethodAdapter` (`JE/execution/BeforeEachMethodAdapter.java:29-31`) / `AfterEachMethodAdapter` (`JE/execution/AfterEachMethodAdapter.java:29-31`), both `extends Extension` |
| Adaptee | the user's `@BeforeEach` / `@AfterEach` `Method` |
| Adapter | the lambda made by `synthesizeBeforeEachMethodAdapter` / `synthesizeAfterEachMethodAdapter` |
| Client | `TestMethodTestDescriptor.invokeBeforeEachMethods` / `invokeAfterEachMethods` |

```java
// JE/execution/BeforeEachMethodAdapter.java
29:  public interface BeforeEachMethodAdapter extends Extension {
31:      void invokeBeforeEachMethod(ExtensionContext context, ExtensionRegistry registry) throws Throwable;

// JE/descriptor/ClassBasedTestDescriptor.java
529:             registrar.registerSyntheticExtension(extensionSynthesizer.apply(method), method);
…
533:     private BeforeEachMethodAdapter synthesizeBeforeEachMethodAdapter(Method method) {
534:         return (extensionContext, registry) -> invokeMethodInExtensionContext(method, extensionContext, registry,
535:             InvocationInterceptor::interceptBeforeEachMethod);

// JE/descriptor/TestMethodTestDescriptor.java  (client: uses it like any other extension)
187:     private void invokeBeforeEachMethods(JupiterEngineExecutionContext context) {
…
189:         invokeBeforeCallbacks(BeforeEachMethodAdapter.class, context, (adapter, extensionContext) -> {
…
191:                 adapter.invokeBeforeEachMethod(extensionContext, registry);
```

The class-level `@BeforeAll`/`@AfterAll` methods are *not* adapted this way. They are invoked directly by `ClassBasedTestDescriptor.invokeBeforeAllMethods` (line 439).

---

## 3. Observer: Confirmed for `TestWatcher`; uncertain for the other lifecycle callbacks

### 3a. `TestWatcher`: confirmed (new class)

`TestWatcher` is an extension, not one of the listener classes counted in area C, but it plays the same role at the Jupiter level. It is notified of each test's outcome, can't change it, and errors it throws are only logged.

| Role | Class |
|---|---|
| Observer interface | `TestWatcher` (`JA/extension/TestWatcher.java:70`), with no-op defaults `testDisabled` (82), `testSuccessful` (94), `testAborted` (107), `testFailed` (120) |
| Registration | any registration path into `MutableExtensionRegistry` (`@ExtendWith`, `@RegisterExtension`, ServiceLoader) |
| Subject / notifier | `MethodBasedTestDescriptor.invokeTestWatchers` (`JE/descriptor/MethodBasedTestDescriptor.java:166-190`) |
| Events raised from | `TestMethodTestDescriptor.nodeFinished` (`:278-291`) and `MethodBasedTestDescriptor.nodeSkipped` (`:158-160`) |

```java
// JE/descriptor/MethodBasedTestDescriptor.java
169:         List<TestWatcher> watchers = context.getExtensionRegistry().getExtensions(TestWatcher.class);
…
171:         Consumer<TestWatcher> action = watcher -> {
172:             try {
173:                 callback.accept(watcher);
174:             }
175:             catch (Throwable throwable) {
…
178:                 logger.warn(throwable,
179:                     () -> "Failed to invoke TestWatcher [%s] for method [%s] with display name [%s]".formatted(
…
186:         if (reverseOrder) {
187:             forEachInReverseOrder(watchers, action);

// JE/descriptor/TestMethodTestDescriptor.java
284:         invokeTestWatchers(context, true, watcher -> {
285:             switch (status) {
286:                 case SUCCESSFUL -> watcher.testSuccessful(extensionContext);
…
288:                 case FAILED -> watcher.testFailed(extensionContext, result.getThrowable().orElse(null));
```

### 3b. `BeforeEachCallback`, `AfterEachCallback` and the other lifecycle callbacks: uncertain

They have the Observer shape: many registered objects, each called at a fixed lifecycle point. For example, `BeforeEachCallback.beforeEach` is declared at `JA/extension/BeforeEachCallback.java:75`, and `CallbackSupport` notifies them all (section 4). But they aren't passive. A `BeforeEachCallback` that throws stops the remaining "before" callbacks and fails the test (`JE/descriptor/CallbackSupport.java:33-37`), and `TempDirectory.beforeEach` injects fields into the test instance. So they are better described as **extension points / hooks** (closer to plug-ins) than as observers.

---

## 4. Template Method: Rejected (one tiny exception)

- **`CallbackSupport`** (`JE/descriptor/CallbackSupport.java:24`) has a fixed algorithm. "Before" callbacks run in order and stop at the first error; "after" callbacks all run, in reverse. But the varying step is passed in as a `CallbackInvoker` lambda (lines 52-57), not overridden in a subclass. It is a static helper with a function parameter, which is closer to Strategy than to Template Method.
  ```java
  33:          for (T callback : registry.getExtensions(type)) {
  34:              throwableCollector.execute(() -> callbackInvoker.invoke(callback, extensionContext));
  35:              if (throwableCollector.isNotEmpty()) {
  36:                  break;
  …
  48:          forEachInReverseOrder(registry.getExtensions(type), //
  49:              callback -> throwableCollector.execute(() -> callbackInvoker.invoke(callback, extensionContext)));
  ```
- **`TestWatcher`, `InvocationInterceptor`** (`JA/extension/InvocationInterceptor.java:107-217`) and the other callback interfaces have default methods that are optional no-ops or a plain `invocation.proceed()`. There's no skeleton calling them in order.
- **`TimeoutExtension`**: `interceptTestMethod`, `interceptBeforeEachMethod` and the rest (`JE/extension/TimeoutExtension.java:67-120`) all funnel into two private helpers. That is code sharing inside one class, not subclass hooks.
- **Tiny exception, `AbstractExtensionContext`.** `getExecutionMode()` is concrete and calls the abstract `getPlatformExecutionMode()`, which each of the six subclasses (`MethodExtensionContext`, `ClassExtensionContext`, …) implements:
  ```java
  // JE/descriptor/AbstractExtensionContext.java
  250:     public ExecutionMode getExecutionMode() {
  251:         return toJupiterExecutionMode(getPlatformExecutionMode());
  …
  264:     protected abstract Node.ExecutionMode getPlatformExecutionMode();
  ```
  This is a one-step Template Method, so small that I'd mention it but not count it.

---

## 5. Composite: Rejected

I checked three hierarchical-looking structures:
- **`ExtensionContext`** has `getParent()` (`JA/extension/ExtensionContext.java:63`) and `getRoot()`, but no `getChildren()`, and no operation that recurses over a tree.
- **`NamespacedHierarchicalStore`** holds only a `parentStore` (`PS/NamespacedHierarchicalStore.java:62`), and lookups walk *up* the chain (section 6b).
- **`MutableExtensionRegistry`** copies its parent's entries when created (`JE/extension/MutableExtensionRegistry.java:141-150, 159-161`) rather than linking to it.

None of them treats one object and a group of objects through the same interface, so none is a part-whole Composite. "Hierarchical" here means *scoped by parent*, not *tree of components*.

---

## 6. Chain of Responsibility: Confirmed for `InvocationInterceptorChain`; uncertain for store lookups

### 6a. `InvocationInterceptorChain`: confirmed (strong)

Every test method, lifecycle method, constructor and factory call goes through a chain of `InvocationInterceptor`s. The chain is built back to front, so the first registered interceptor is outermost. Each one gets an `Invocation` for "the rest of the chain" and decides whether to call `proceed()`, call `skip()`, or wrap it in something else first.

| Role | Class |
|---|---|
| Handler | `InvocationInterceptor` (`JA/extension/InvocationInterceptor.java:64`) |
| Concrete handlers | `TimeoutExtension` and user interceptors |
| Link to the next handler | `InterceptedInvocation` (`JE/execution/InvocationInterceptorChain.java:94-106`) |
| Request | `Invocation` (`JA/extension/InvocationInterceptor.java:231`, with `proceed()` at 239 and `skip()` at 248) |
| Client | `InterceptingExecutableInvoker.invoke` (`JE/execution/InterceptingExecutableInvoker.java:96-106`) |

```java
// JE/execution/InvocationInterceptorChain.java
52:      private <T> Invocation<T> chainInterceptors(Invocation<T> invocation, InterceptorCall<T> call,
…
55:          Invocation<T> result = invocation;
56:          ListIterator<InvocationInterceptor> iterator = interceptors.listIterator(interceptors.size());
57:          while (iterator.hasPrevious()) {
58:              InvocationInterceptor interceptor = iterator.previous();
59:              result = new InterceptedInvocation<>(result, call, interceptor);
…
94:      private record InterceptedInvocation<T>(Invocation<T> invocation, InterceptorCall<T> call,
95:              InvocationInterceptor interceptor) implements Invocation<T> {
…
98:          public T proceed() throws Throwable {
99:              return call.apply(interceptor, invocation);
```

**Note for the case study.** In classic GoF CoR, one handler deals with the request and the rest never see it. Here, by default, every interceptor passes it on. That is the "interceptor chain" / pipeline variant of CoR, also known as the Interceptor pattern (POSA2). The class name makes the intent explicit, and a handler *can* stop the chain with `skip()`, so I'd count it as CoR with that note.

### 6b. Store lookups that fall back to the parent: uncertain

```java
// PS/NamespacedHierarchicalStore.java
465:     private @Nullable StoredValue getStoredValue(CompositeKey<N> compositeKey) {
466:         StoredValue storedValue = this.storedValues.get(compositeKey);
467:         if (StoredValue.isNonNullAndPresent(storedValue)) {
468:             return storedValue;
469:         }
470:         if (this.parentStore != null) {
471:             return this.parentStore.getStoredValue(compositeKey);
```
Structurally this matches GoF's own CoR example: ask yourself, and if you can't answer, ask your parent. In practice it's a scoped lookup (like nested variable scopes), with the same handler type and the same logic at every level. I'd call it uncertain, or mention it as "CoR-shaped scope lookup".

---

## 7. Decorator: Confirmed (strong)

`TimeoutExtension` is itself an interceptor in the chain above. To enforce a timeout, it wraps the `Invocation` it receives in a timeout-aware `Invocation`. That wrapper implements the same interface, keeps the original as `delegate`, and adds behaviour before and after `delegate.proceed()`.

| Role | Class |
|---|---|
| Component | `InvocationInterceptor.Invocation` |
| Concrete component | `MethodInvocation` / `ConstructorInvocation`, or the rest of the chain |
| Decorators | `SameThreadTimeoutInvocation` (`JE/extension/SameThreadTimeoutInvocation.java:26`), `SeparateThreadTimeoutInvocation` (`JE/extension/SeparateThreadTimeoutInvocation.java:24`), `ValidatingInvocation` (`JE/execution/InvocationInterceptorChain.java:108`) |
| Chosen by | `TimeoutInvocationFactory.create` (`JE/extension/TimeoutInvocationFactory.java:35-46`), depending on `@Timeout(threadMode = …)` |

```java
// JE/extension/TimeoutExtension.java
163:         return decorate(invocation, invocationContext, extensionContext, timeout, timeoutConfiguration).proceed();
…
178:     private <T extends @Nullable Object> Invocation<T> decorate(Invocation<T> invocation,
…
182:         if (timeout == null) {
183:             return invocation;
…
187:         return new TimeoutInvocationFactory(extensionContext.getRoot().getStore(NAMESPACE)).create(threadMode,

// JE/extension/SameThreadTimeoutInvocation.java
26:  class SameThreadTimeoutInvocation<T extends @Nullable Object> implements Invocation<T> {
28:      private final Invocation<T> delegate;
…
45:      public T proceed() throws Throwable {
46:          InterruptTask interruptTask = new InterruptTask(Thread.currentThread(), preInterruptCallback);
47:          ScheduledFuture<?> future = executor.schedule(interruptTask, timeout.value(), timeout.unit());
…
51:              result = delegate.proceed();

// JE/extension/SeparateThreadTimeoutInvocation.java
41:      public T proceed() throws Throwable {
42:          return executeWithPreemptiveTimeout(timeout.toDuration(), delegate::proceed, descriptionSupplier,
```

The two timeout decorators also act as two **strategies** for the same job: interrupt the current thread, or run on a separate thread and abandon it. `ValidatingInvocation` (lines 108-138) is a third decorator that adds a "proceed or skip exactly once" check around the original invocation (line 136: "Chain of InvocationInterceptors called invocation multiple times instead of just once").

---

## 8. Command: Confirmed (small)

`MethodInvocation` (`JE/execution/MethodInvocation.java:25`) and `ConstructorInvocation` package "call this method on this target with these arguments" as an object. The arguments are already resolved by `ParameterResolutionUtils`. Interceptors can then run it later, run it on another thread (as `SeparateThreadTimeoutInvocation` does), or `skip()` it.
```java
// JE/execution/InterceptingExecutableInvoker.java
96:          Object[] arguments = resolveParameters(method, optionalTarget, extensionContext, extensionRegistry);
97:          MethodInvocation<T> invocation = new MethodInvocation<>(method, optionalTarget, arguments);

// JE/execution/MethodInvocation.java
59:      public T proceed() {
60:          var actualTarget = this.target.orElse(null);
61:          return (T) MethodReflectionUtils.invoke(this.method, actualTarget, this.arguments);
```
Area B counted Command for `NodeTestTask`. These are different classes, so this is a new instance, but a small one.

---

## 9. Classes that look like a pattern but don't follow it

| Class | Looks like | What it really is |
|---|---|---|
| `TempDirFactory` | GoF Factory Method / Abstract Factory | A **creation strategy** (section 1a). There is no creator class whose other methods call an overridable factory method. `TempDirectory` just calls whichever `TempDirFactory` was chosen. |
| `TimeoutInvocationFactory` (`JE/extension/TimeoutInvocationFactory.java:27`) | GoF Factory Method | A **simple factory**: one `if` on `ThreadMode` choosing between two decorators (lines 39-46). No subclass decides anything. |
| `CleanupMode` (`JA/io/CleanupMode.java:29`) | Strategy or State | A plain **enum flag** (`DEFAULT`, `ALWAYS`, `ON_SUCCESS`, `NEVER`). The constants have no behaviour; `Cleanup.run` checks them with an `if` (`TempDirectory.java:341`). The real deletion strategy is `TempDirDeletionStrategy`. |
| `MutableExtensionRegistry` | Registry / Service Locator, or Prototype (it copies its parent) | A **scoped, typed list** of extensions, one per node. It isn't global and isn't looked up by key. The parent copy is a copy constructor (lines 159-176), not cloning through a `clone()` interface. |
| `ExtensionRegistry` (`JE/extension/ExtensionRegistry.java:40, 49`) | Template Method (`getExtensions` is a default built on `stream`) | A **convenience default method**: `getExtensions` just collects `stream(type)` into a list. |
| `ExtensionContext` and `AbstractExtensionContext` | Composite (parent links), or the "Context" role of Strategy | A **Context Object**: one object giving an extension everything about where it runs (element, test instance, store, configuration, report publishing). It has parents but no children (section 5). |
| `NamespacedHierarchicalStore` | Composite (from "Hierarchical") | A **scoped map** with a parent fallback (CoR-shaped, section 6b) and an injected close strategy (section 1e). |
| `ConditionEvaluator` | Chain of Responsibility | A **loop over strategies** with an "any disabled wins" rule (section 1d). The conditions don't know about each other or forward anything. |
| `ParameterResolutionUtils` | Chain of Responsibility | **Strategy selection** by `supportsParameter`. All resolvers are asked, and two matches is an error (section 1c). |
| `BeforeEachMethodAdapter` / `AfterEachMethodAdapter` | — | These *are* Adapters (section 2b). Unlike most "Adapter"-named classes in areas A to C, the name fits. |
| `CallbackSupport` | Template Method | A **static helper** taking a lambda (section 4). |
| `AutoCloseExtension` (`JE/extension/AutoCloseExtension.java:44`) | Adapter (calls any named close method by reflection), or a Dispose pattern | A **concrete callback extension**. In `preDestroyTestInstance` (49) and `afterAll` (57) it finds `@AutoClose` fields and calls their close method. It adapts nothing to an interface a client expects. |
| `TempDirectory.CloseablePath` (`TempDirectory.java:255`) | Proxy for `Path` | A **resource holder** stored in the extension store so the store's close action deletes the directory. It isn't a stand-in for `Path`; `get()` hands out the real `Path`. |

---

## How the patterns fit together in one test

1. Extensions are registered level by level into a `MutableExtensionRegistry` (scoped list, not Composite). `@BeforeEach`/`@AfterEach` methods join as synthetic extensions (**Adapter**, 2b).
2. `ConditionEvaluator` asks each `ExecutionCondition` whether the test may run (**Strategy**, 1d).
3. `CallbackSupport` runs the lifecycle callbacks in order and the "after" ones in reverse (hooks, 3b).
4. To call the test method, `ParameterResolutionUtils` picks one `ParameterResolver` per parameter (**Strategy**, 1c). For `@TempDir`, that is `TempDirectory`, which creates the directory through a `TempDirFactory` (**Strategy**, 1a) and stores it via `NamespaceAwareStore` (**Adapter**, 2a).
5. The resolved call becomes a `MethodInvocation` (**Command**, 8) and runs through the `InvocationInterceptorChain` (**Chain of Responsibility**, 6a). `TimeoutExtension` wraps it in a timeout invocation (**Decorator**, 7).
6. `TestWatcher`s are told the outcome (**Observer**, 3a).
7. When the node's extension context closes, `NamespacedHierarchicalStore` closes values in reverse insertion order using Jupiter's `CloseAction` (**Strategy**, 1e). That deletes the temp directory through the chosen `TempDirDeletionStrategy` (**Strategy**, 1b), unless `CleanupMode` (a flag) says to keep it.
