<!-- Raw output of Part 1, prompt 3 (Part1/llm/prompt_3_areaA_patterns.txt), same Claude chat as prompts 1-2.
     Copied verbatim: section 1 = chat reply, section 2 = attached file area-a-design-patterns.md. -->

# 1. Chat reply

All five patterns are really used in area A, but Adapter only shows up in a few small classes. The full analysis is in 
area-a-design-patterns.md
. For each pattern it maps the roles to classes and gives file paths, line numbers and code snippets from commit f59f60d.

Composite: confirmed. Every node in the discovery tree is a TestDescriptor, whether it holds other tests or is a single test. Operations like accept, prune and findByUniqueId recurse over the whole tree the same way. getType() decides at run time whether a node is a leaf, not the class hierarchy. CompositeFilter is a second, smaller Composite.
Strategy: confirmed. EngineDiscoveryOrchestrator holds a list of PostDiscoveryFilters and calls apply() on each without knowing what kind it is. The tag, method-name, class-name and engine filters all plug in this way.
Template Method: confirmed in the Jupiter descriptors. JupiterTestDescriptor has final skeleton methods such as getExecutionMode() and getLegacyReportingName(), plus copyIncludingDescendants(). Subclasses override the hook methods those skeletons call. AbstractOrderingVisitor is another example.
Observer: confirmed. The orchestrator and each engine send discovery events to LauncherDiscoveryListeners, which are registered on the launcher and broadcast to through a composite listener.
Adapter: confirmed, but narrow. None of the core classes you listed is an adapter. The real ones are nearby: DefaultClassDescriptor and DefaultMethodDescriptor let your own class and method orderers see internal descriptors through the public API types, and DiscoveryIssueReporter.forwarding is a small one too.

Some names point to patterns the classes don’t actually implement:

AbstractTestDescriptor is a base class of shared method implementations, not Template Method.
TagFilter is a static factory that never implements Filter itself.
TestDescriptor.Visitor is a tree-walk callback with no double dispatch, so it isn’t GoF Visitor.
DelegatingLauncherDiscoveryRequest is a decorator, not an adapter.
TestIdentifier is a data snapshot, not an adapter.

# 2. Attached file: area-a-design-patterns.md

# Area A: design patterns in test discovery and the descriptor hierarchy

JUnit 6.1.3, commit `f59f60d2cebdf2224235d81f781b1f310cbc8138`. Every line number and snippet below was read from that commit. Snippets are trimmed to the lines that matter; `…` marks omitted lines.

## Verdicts at a glance

| Pattern | Verdict | Where | One-line reason |
|---|---|---|---|
| Composite | **Confirmed** | `TestDescriptor` tree; `CompositeFilter` | Containers and tests share one interface, and recursive operations (`accept`, `prune`, `findByUniqueId`) treat them the same way. |
| Strategy | **Confirmed** | `Filter` / `PostDiscoveryFilter` used by `EngineDiscoveryOrchestrator` | The orchestrator applies interchangeable filter objects without knowing which kind they are. |
| Template Method | **Confirmed** (in Jupiter descriptors) | `JupiterTestDescriptor`, `AbstractOrderingVisitor` | `final` skeleton methods call hook methods that subclasses override. |
| Observer | **Confirmed** | `LauncherDiscoveryListener` notified by `EngineDiscoveryOrchestrator` | Discovery publishes events to a list of registered listeners that it doesn't know concretely. |
| Adapter | **Confirmed, but narrow** | `DefaultClassDescriptor`, `DefaultMethodDescriptor`, `DiscoveryIssueReporter.forwarding`, `Filter.toPredicate` | These convert internal objects into a different interface that a client expects. Not found in the core classes you listed. |

Section 6 covers classes whose names suggest a pattern they don't really implement: `AbstractTestDescriptor`, `TagFilter`, `TestDescriptor.Visitor`, `DelegatingLauncherDiscoveryRequest`, `TestIdentifier`, `CompositeLauncherDiscoveryListener` and `CompositeTestDescriptorVisitor`.

---

## 1. Composite: Confirmed

### How it is used
Discovery builds a tree. The engine contains classes, classes contain methods (and `@Nested` classes), and a `@TestFactory` contains dynamic tests. Every node, container or leaf, implements the same `TestDescriptor` interface. That lets the launcher and engines run one operation over a whole subtree without checking what each node is.

### Roles

| Composite role | JUnit class / method |
|---|---|
| Component | `TestDescriptor` (interface) |
| Shared child management | `AbstractTestDescriptor` (`children` set, `addChild`, `removeChild`, `removeFromHierarchy`, `findByUniqueId`) |
| Composite (container) | `EngineDescriptor` / `JupiterEngineDescriptor`, `ClassBasedTestDescriptor` (`ClassTestDescriptor`, `NestedClassTestDescriptor`, `ClassTemplateTestDescriptor`), `TestTemplateTestDescriptor`, `TestFactoryTestDescriptor`, `DynamicContainerTestDescriptor` |
| Leaf | `TestMethodTestDescriptor`, `TestTemplateInvocationTestDescriptor`, `DynamicTestTestDescriptor` |
| Uniform recursive operations | `TestDescriptor.accept(Visitor)`, `getDescendants()`, `prune()`, `containsTests()`, `AbstractTestDescriptor.findByUniqueId()` |
| Client | `EngineDiscoveryOrchestrator` (filters and prunes every tree the same way) |

### Evidence

`junit-platform-engine/src/main/java/org/junit/platform/engine/TestDescriptor.java` defines the component interface, with child management and recursion:

```java
37:  public interface TestDescriptor {
…
106:     Optional<TestDescriptor> getParent();
125:     Set<? extends TestDescriptor> getChildren();
175:     void addChild(TestDescriptor descriptor);
183:     void removeChild(TestDescriptor descriptor);
…
161:     default Set<? extends TestDescriptor> getDescendants() {
163:         descendants.addAll(getChildren());
164:         for (TestDescriptor child : getChildren()) {
165:             descendants.addAll(child.getDescendants());
…
307:     static boolean containsTests(TestDescriptor testDescriptor) {
309:         return testDescriptor.isTest() || testDescriptor.mayRegisterTests()
310:                 || testDescriptor.getChildren().stream().anyMatch(TestDescriptor::containsTests);
…
345:     default void accept(Visitor visitor) {
347:         visitor.visit(this);
348:         this.getChildren().forEach(child -> child.accept(visitor));
349:     }
```

`junit-platform-engine/src/main/java/org/junit/platform/engine/support/descriptor/AbstractTestDescriptor.java` holds the children collection and a recursive search:

```java
69:      protected final Set<TestDescriptor> children = Collections.synchronizedSet(new LinkedHashSet<>(16));
…
155:     public void addChild(TestDescriptor child) {
157:         child.setParent(this);
158:         this.children.add(child);
…
195:     public Optional<? extends TestDescriptor> findByUniqueId(UniqueId uniqueId) {
197:         if (getUniqueId().equals(uniqueId)) {
198:             return Optional.of(this);
199:         }
201:         return this.children.stream()
202:                 .map(child -> child.findByUniqueId(uniqueId))
```

Leaf and container are told apart by a type flag, not by separate classes:

```java
// junit-platform-engine/src/main/java/org/junit/platform/engine/support/descriptor/EngineDescriptor.java
48:     @Override
49:     public Type getType() {
50:         return Type.CONTAINER;

// junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/TestMethodTestDescriptor.java
105:     @Override
106:     public Type getType() {
107:         return Type.TEST;
```

The client in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineDiscoveryOrchestrator.java` treats every node uniformly:

```java
265:     private void prune(Map<TestEngine, EngineResultInfo> testEngineResults) {
266:         acceptInAllTestEngines(testEngineResults, TestDescriptor::prune);
…
275:         testEngineResults.values().forEach(result -> result.getRootDescriptor().accept(visitor));
```

### A second, smaller Composite: `CompositeFilter`
`junit-platform-engine/src/main/java/org/junit/platform/engine/CompositeFilter.java` implements `Filter<T>` and holds a list of `Filter<T>`. Callers can't tell it apart from a single filter. It combines its children with AND and returns the first exclusion.

```java
29:  class CompositeFilter<T> implements Filter<T> {
…
52:      private final Collection<Filter<T>> filters;
…
59:      public FilterResult apply(T element) {
61:          return filters.stream()
62:                  .map(filter -> filter.apply(element))
63:                  .filter(FilterResult::excluded)
64:                  .findFirst()
65:                  .orElse(INCLUDED_BY_ALL_FILTERS);
```

It is created by `Filter.composeFilters` (`Filter.java:78-88`), which returns the only filter unchanged when there is just one, and a shared "always included" filter when there are none. `EngineDiscoveryOrchestrator.java:227` uses it to merge all post-discovery filters into one.

### Notes for your case study
- This is the **transparent** variant of Composite. Leaves still have `addChild`/`removeChild`, because `TestDescriptor` declares them for every node. Whether a node is a leaf is decided at run time by `getType()` (`TEST`, `CONTAINER` or `CONTAINER_AND_TEST`), not by the class hierarchy.
- That choice matters because the class hierarchy doesn't line up with leaf versus container. For example, `TestFactoryTestDescriptor extends TestMethodTestDescriptor` (a leaf class) but overrides `getType()` to return `CONTAINER` (`TestFactoryTestDescriptor.java:97-99`), because it produces dynamic children.
- A related case outside your list: `TagFilter` parses expressions into a tree of `TagExpression` objects. `TagExpressions.not`, `and` and `or` (`junit-platform-launcher/src/main/java/org/junit/platform/launcher/tagexpression/TagExpressions.java:65-97`) wrap other `TagExpression`s, which is Composite used in the style of the Interpreter pattern.

---

## 2. Strategy: Confirmed

### How it is used
The launcher has to decide which nodes to keep, but it shouldn't know how each rule works (tags, method names, class names, engine IDs). Every rule implements one interface, `Filter<T>` with a single `apply` method. The launcher holds a list of filter objects and calls them the same way. New rules can be added through the request or `ServiceLoader` without changing the launcher.

### Roles

| Strategy role | JUnit class / method |
|---|---|
| Strategy interface | `Filter<T>` (`FilterResult apply(T)`); narrowed to `PostDiscoveryFilter extends Filter<TestDescriptor>`, `DiscoveryFilter<T>`, and `EngineFilter implements Filter<TestEngine>` |
| Concrete strategies | Lambdas returned by `TagFilter.includeTags` / `excludeTags`; `IncludeMethodFilter`, `ExcludeMethodFilter` (through `MethodFilter extends PostDiscoveryFilter`); `IncludeClassNameFilter`, `ExcludeClassNameFilter`; `EngineFilter` |
| Context | `EngineDiscoveryOrchestrator` (field `postDiscoveryFilters`, method `applyPostDiscoveryFilters`) |
| Result object | `FilterResult` (included/excluded plus a reason) |

### Evidence

The strategy interface, in `junit-platform-engine/src/main/java/org/junit/platform/engine/Filter.java`:

```java
39:  @FunctionalInterface
41:  public interface Filter<T> {
…
108:     FilterResult apply(T object);
```

Specialization for discovered trees, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/PostDiscoveryFilter.java`:

```java
35:  public interface PostDiscoveryFilter extends Filter<TestDescriptor> {
36:  }
```

The context, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineDiscoveryOrchestrator.java`. It stores strategies and uses them only through the interface:

```java
56:      private final Collection<PostDiscoveryFilter> postDiscoveryFilters;
…
180:         List<PostDiscoveryFilter> filters = new ArrayList<>(postDiscoveryFilters);
181:         filters.addAll(request.getPostDiscoveryFilters());
…
227:         Filter<TestDescriptor> postDiscoveryFilter = composeFilters(filters);
…
229:         TestDescriptor.Visitor removeExcludedTestDescriptors = descriptor -> {
230:             FilterResult filterResult = postDiscoveryFilter.apply(descriptor);
231:             if (!descriptor.isRoot() && isExcluded(descriptor, filterResult)) {
…
233:                 descriptor.removeFromHierarchy();
```

A concrete strategy built as a lambda, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TagFilter.java`:

```java
130:     private static PostDiscoveryFilter includeMatching(List<String> tagExpressions) {
…
133:         List<TagExpression> parsedTagExpressions = parseAll(tagExpressions);
134:         return descriptor -> {
135:             Set<TestTag> tags = descriptor.getTags();
136:             boolean included = parsedTagExpressions.stream().anyMatch(expression -> expression.evaluate(tags));
138:             return FilterResult.includedIf(included, inclusionReason, exclusionReason);
139:         };
```

A concrete strategy as a class, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/EngineFilter.java` (used through `EngineFilterer` at `EngineDiscoveryOrchestrator.java:160-163`):

```java
42:  public class EngineFilter implements Filter<TestEngine> {
…
123:     public FilterResult apply(TestEngine testEngine) {
```

### Related Strategy uses in area A
- **Child ordering.** `TestDescriptor.orderChildren(UnaryOperator<List<TestDescriptor>> orderer)` (`TestDescriptor.java:209`, `AbstractTestDescriptor.java:180`) takes the ordering algorithm as a parameter. Jupiter passes user-chosen `ClassOrderer` / `MethodOrderer` implementations (`junit-jupiter-api/src/main/java/org/junit/jupiter/api/ClassOrderer.java:64`, with built-ins `Default`, `ClassName`, `DisplayName`, `OrderAnnotation` at lines 120-192).
- **Selector resolution.** `EngineDiscoveryRequestResolution` holds a `List<SelectorResolver>` and tries each in turn until one resolves (`junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/EngineDiscoveryRequestResolution.java:185-191`). The resolvers are pluggable strategies. Because the code stops at the first one that succeeds, it also looks like **Chain of Responsibility**.

### Note for your case study
Because `Filter` is a `@FunctionalInterface`, most strategies are lambdas instead of named classes. This is still Strategy, just written in modern Java. `TagFilter` itself is not a strategy (see section 6).

---

## 3. Template Method: Confirmed in the Jupiter descriptors

### How it is used
`JupiterTestDescriptor` fixes the steps of several algorithms in `final` (or effectively fixed) methods. Specific steps are left as protected or package-private hooks that subclasses override. The clearest cases are working out a node's parallel execution mode, building its legacy reporting name, and deep-copying a subtree.

### Roles

| Template Method role | JUnit class / method |
|---|---|
| Abstract class | `JupiterTestDescriptor` |
| Template method 1 | `getExecutionMode()`, declared `final`, line 163 |
| Hooks for 1 | `getExplicitExecutionMode()`, `getExplicitChildExecutionMode()`, `getDefaultChildExecutionMode()`, `getDefaultExecutionMode()` |
| Template method 2 | `getLegacyReportingName()`, declared `final`, line 85 |
| Hooks for 2 | `getLegacyReportingBaseName()`, `getLegacyReportingIndex()` |
| Template method 3 | `copyIncludingDescendants(...)`, line 256 |
| Primitive operation for 3 | `abstract withUniqueId(...)`, line 268 |
| Concrete classes | `ClassBasedTestDescriptor`, `MethodBasedTestDescriptor`, `DynamicNodeTestDescriptor`, `DynamicContainerTestDescriptor`, `ClassTestDescriptor`, `TestMethodTestDescriptor`, and the rest |

### Evidence

The template method with its default hooks, in `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/JupiterTestDescriptor.java`:

```java
162:     @Override
163:     public final ExecutionMode getExecutionMode() {
164:         return getExplicitExecutionMode() //
165:                 .or(this::determineExecutionModeFromAncestors) //
166:                 .orElseGet(this::getDefaultExecutionMode);
167:     }
…
187:     Optional<ExecutionMode> getExplicitChildExecutionMode() {
188:         return Optional.empty();
189:     }
191:     Optional<ExecutionMode> getExplicitExecutionMode() {
192:         return Optional.empty();
193:     }
```

The hooks overridden in subclasses:

```java
// junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ClassBasedTestDescriptor.java
167:     protected final Optional<ExecutionMode> getExplicitExecutionMode() {
168:         return getExecutionModeFromAnnotation(getTestClass());
…
172:     protected final Optional<ExecutionMode> getDefaultChildExecutionMode() {
173:         return Optional.ofNullable(this.classInfo.defaultChildExecutionMode);

// junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/MethodBasedTestDescriptor.java
147:     protected Optional<ExecutionMode> getExplicitExecutionMode() {
148:         return getExecutionModeFromAnnotation(getTestMethod());
```

Other overrides: `DynamicNodeTestDescriptor.java:43` and `DynamicContainerTestDescriptor.java:62`.

The second template method:

```java
85:      public final String getLegacyReportingName() {
86:          return getLegacyReportingBaseName()
87:                  + getLegacyReportingIndexes().mapToObj(i -> "[" + i + "]").collect(joining());
88:      }
90:      protected String getLegacyReportingBaseName() {
91:          return getDisplayName();
…
104:     protected OptionalInt getLegacyReportingIndex() {
105:         return OptionalInt.empty();
```

Overridden in `ClassBasedTestDescriptor.java:131`, `MethodBasedTestDescriptor.java:90`, `DynamicNodeTestDescriptor.java:48,62`, `TestTemplateInvocationTestDescriptor.java:76`, and `ClassTemplateInvocationTestDescriptor.java:88,93`.

The third template method, with an abstract primitive:

```java
256:     protected JupiterTestDescriptor copyIncludingDescendants(UnaryOperator<UniqueId> uniqueIdTransformer) {
257:         JupiterTestDescriptor result = withUniqueId(uniqueIdTransformer);
258:         getChildren().forEach(oldChild -> {
259:             TestDescriptor newChild = ((JupiterTestDescriptor) oldChild).copyIncludingDescendants(uniqueIdTransformer);
260:             result.addChild(newChild);
…
268:     protected abstract JupiterTestDescriptor withUniqueId(UnaryOperator<UniqueId> uniqueIdTransformer);
```

The primitive is implemented in 10 subclasses. For example, in `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ClassTestDescriptor.java`:

```java
63:      protected ClassTestDescriptor withUniqueId(UnaryOperator<UniqueId> uniqueIdTransformer) {
64:          return new ClassTestDescriptor(uniqueIdTransformer.apply(getUniqueId()), getTestClass(), getDisplayName(),
```

### Another Template Method in area A: `AbstractOrderingVisitor`
In `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/AbstractOrderingVisitor.java`, `orderChildrenTestDescriptors` (lines 72-119) runs the fixed ordering algorithm: select matching children, wrap them, sort, unwrap, merge. It asks one abstract hook where the non-matching children go:

```java
110:             if (shouldNonMatchingDescriptorsComeBeforeOrderedOnes()) {
111:                 return Stream.concat(nonMatchingTestDescriptors, orderedTestDescriptors)
…
126:     protected abstract boolean shouldNonMatchingDescriptorsComeBeforeOrderedOnes();
```

`ClassOrderingVisitor.java:72` and `MethodOrderingVisitor.java:77` implement the hook in opposite ways.

### A weaker form in the platform interface
`TestDescriptor`'s default methods `isContainer()` (line 262), `isTest()` (line 278) and `prune()` (line 324) are fixed algorithms built on the abstract `getType()`, `getChildren()` and the hook `mayRegisterTests()`. That is Template Method in shape, but interface default methods can't be `final`, so subclasses could override the skeleton too.

---

## 4. Observer: Confirmed

### How it is used
While discovery runs, the launcher and engines announce progress: discovery started or finished, each engine started or finished, each selector resolved or unresolved, and each problem found. Anyone interested, such as logging, issue collection, an IDE or JFR, registers a `LauncherDiscoveryListener`. The code raising the events only knows the interface.

### Roles

| Observer role | JUnit class / method |
|---|---|
| Observer interface | `LauncherDiscoveryListener extends EngineDiscoveryListener` |
| Subjects (raise events) | `EngineDiscoveryOrchestrator` (launcher- and engine-level events); `EngineDiscoveryRequestResolution` inside each engine (`selectorProcessed`); `DiscoveryIssueReporter` (`issueEncountered`) |
| Registration | `DefaultLauncher.registerLauncherDiscoveryListeners(...)`, `ServiceLoader` loading in `LauncherFactory`, and the per-request listener in `LauncherDiscoveryRequest` |
| Broadcast | `ListenerRegistry.getCompositeListener()` → `CompositeLauncherDiscoveryListener` |
| Concrete observers | `DiscoveryIssueCollector`, `LoggingLauncherDiscoveryListener`, `AbortOnFailureLauncherDiscoveryListener`, `FlightRecordingDiscoveryListener` |

### Evidence

The observer interfaces:

```java
// junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherDiscoveryListener.java
42:  public interface LauncherDiscoveryListener extends EngineDiscoveryListener {

// junit-platform-engine/src/main/java/org/junit/platform/engine/EngineDiscoveryListener.java
31:  public interface EngineDiscoveryListener {
51:      default void selectorProcessed(UniqueId engineId, DiscoverySelector selector, SelectorResolutionResult result) {
64:      default void issueEncountered(UniqueId engineId, DiscoveryIssue issue) {
```

Registration, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DefaultLauncher.java`:

```java
73:      public void registerLauncherDiscoveryListeners(LauncherDiscoveryListener... listeners) {
…
76:          this.listenerRegistry.launcherDiscoveryListeners.addAll(listeners);
```

The subject assembles its observers and notifies them, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineDiscoveryOrchestrator.java`:

```java
216:     LauncherDiscoveryListener getLauncherDiscoveryListener(LauncherDiscoveryRequest discoveryRequest,
217:             DiscoveryIssueCollector issueCollector) {
218:         var delegate = ListenerRegistry.copyOf(launcherDiscoveryListenerRegistry) //
219:                 .add(discoveryRequest.getDiscoveryListener()) //
220:                 .add(issueCollector) //
221:                 .getCompositeListener();
…
116:         listener.launcherDiscoveryStarted(request);
…
125:             listener.launcherDiscoveryFinished(request);
…
194:             listener.engineDiscoveryStarted(uniqueEngineId);
195:             TestDescriptor engineRoot = testEngine.discover(request, uniqueEngineId);
…
197:             listener.engineDiscoveryFinished(uniqueEngineId, EngineDiscoveryResult.successful());
```

Inside the engine, the same listener is notified for every selector, in `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/EngineDiscoveryRequestResolution.java`:

```java
91:          EngineDiscoveryListener discoveryListener = request.getDiscoveryListener();
…
96:                  discoveryListener.selectorProcessed(engineId, selector, resolved());
…
100:                 discoveryListener.selectorProcessed(engineId, selector, unresolved());
```

The broadcast, in `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/discovery/CompositeLauncherDiscoveryListener.java`:

```java
29:  class CompositeLauncherDiscoveryListener implements LauncherDiscoveryListener {
31:      private final List<LauncherDiscoveryListener> listeners;
…
38:      public void launcherDiscoveryStarted(LauncherDiscoveryRequest request) {
39:          listeners.forEach(delegate -> delegate.launcherDiscoveryStarted(request));
…
43:      public void launcherDiscoveryFinished(LauncherDiscoveryRequest request) {
44:          forEachInReverseOrder(listeners, delegate -> delegate.launcherDiscoveryFinished(request));
```

A concrete observer: `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DiscoveryIssueCollector.java:25`, `class DiscoveryIssueCollector implements LauncherDiscoveryListener`.

### Notes for your case study
- This is a **push** model: the event data (request, engine ID, result) travels with each call.
- It differs from textbook GoF Observer in two ways. The subject has no `attach`/`detach` methods of its own; observers are collected in a `ListenerRegistry` and frozen into one composite listener for each discovery run. Observers also aren't watching a changing subject state; they receive one-off lifecycle events. Many textbooks call this the *listener* or *event-notification* style of Observer.
- The composite listener sends "started" events in registration order and "finished" events in reverse order (lines 39 and 44), so listeners nest like brackets.

---

## 5. Adapter: Confirmed, but narrow

None of the core classes you listed (`TestDescriptor`, `AbstractTestDescriptor`, `EngineDescriptor`, `Filter`, `CompositeFilter`, `PostDiscoveryFilter`, `TagFilter`, `EngineDiscoveryOrchestrator`) is an Adapter. Real adapters do appear in the area A files around them.

### 5a. `DefaultClassDescriptor` / `DefaultMethodDescriptor` (strongest example)

User-written `ClassOrderer` / `MethodOrderer` code expects the public API types `ClassDescriptor` / `MethodDescriptor`. The engine holds internal `ClassBasedTestDescriptor` / `MethodBasedTestDescriptor` objects. The wrappers convert one into the other, so internal classes never leak into user code.

| Adapter role | JUnit class |
|---|---|
| Target | `junit-jupiter-api/src/main/java/org/junit/jupiter/api/ClassDescriptor.java:28` and `.../MethodDescriptor.java:29` |
| Adaptee | `ClassBasedTestDescriptor`, `MethodBasedTestDescriptor` |
| Adapter | `DefaultClassDescriptor`, `DefaultMethodDescriptor` (shared base `AbstractAnnotatedDescriptorWrapper`) |
| Client | User `ClassOrderer` / `MethodOrderer`, called from `ClassOrderingVisitor` / `MethodOrderingVisitor` |

```java
// junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/AbstractAnnotatedDescriptorWrapper.java
28:  abstract class AbstractAnnotatedDescriptorWrapper<E extends AnnotatedElement> {
30:      private final TestDescriptor testDescriptor;
…
46:      public final String getDisplayName() {
47:          return this.testDescriptor.getDisplayName();

// junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/DefaultClassDescriptor.java
23:  class DefaultClassDescriptor extends AbstractAnnotatedDescriptorWrapper<Class<?>> implements ClassDescriptor {
25:      DefaultClassDescriptor(ClassBasedTestDescriptor testDescriptor) {
26:          super(testDescriptor, testDescriptor.getTestClass());
```

After the user's orderer sorts the wrappers, they are unwrapped back to descriptors at `AbstractOrderingVisitor.java:107-108` (`.map(AbstractAnnotatedDescriptorWrapper::getTestDescriptor)`).

### 5b. `DiscoveryIssueReporter.forwarding` (a lambda adapter)
This makes an `EngineDiscoveryListener` usable where a `DiscoveryIssueReporter` is expected. `JupiterTestEngine.discover` uses it to turn the request's listener into a reporter.

```java
// junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/DiscoveryIssueReporter.java
48:      static DiscoveryIssueReporter forwarding(EngineDiscoveryListener engineDiscoveryListener, UniqueId engineId) {
…
51:          return issue -> engineDiscoveryListener.issueEncountered(engineId, issue);
```

### 5c. `Filter.toPredicate()` and the deprecated `Filter.adaptFilter`

```java
// junit-platform-engine/src/main/java/org/junit/platform/engine/Filter.java
101:     static <T, V> Filter<T> adaptFilter(Filter<V> adaptee, Function<T, V> converter) {
102:         return input -> adaptee.apply(converter.apply(input));
…
115:     default Predicate<T> toPredicate() {
116:         return object -> apply(object).included();
```

`toPredicate` adapts a JUnit `Filter` to the JDK's `java.util.function.Predicate`. `adaptFilter` is even named after the pattern, but it is marked `@Deprecated(since = "6.0", forRemoval = true)` (line 100), so don't build your argument on it.

### Why "narrow"
The adapters are small and live at the edges, converting between an internal type and an API or JDK type. Adapter isn't a structural pillar of discovery the way Composite and Strategy are.

---

## 6. Classes that look like a pattern but don't implement it

| Class | Looks like | What it really is |
|---|---|---|
| `AbstractTestDescriptor` (`junit-platform-engine/.../support/descriptor/AbstractTestDescriptor.java:42`) | Template Method (an "Abstract…" base class) | A **skeletal implementation** (Effective Java's "abstract interface implementation"). It supplies reusable concrete bodies for `TestDescriptor` methods, and many of its own are `final` (`getUniqueId`, `getParent`, `getChildren`). The only abstract operation it leaves open is the inherited `getType()`, and none of its own methods call `getType()`. There is no algorithm skeleton deferring steps to subclasses, so it is not Template Method. In area A, Template Method lives one level down, in `JupiterTestDescriptor`. |
| `TagFilter` (`junit-platform-launcher/.../TagFilter.java:48`) | A Filter strategy, or a Composite of filters | A `final` **static factory / utility class** with a private constructor (lines 48-52). It does **not** implement `Filter` or `PostDiscoveryFilter`. Its static methods `includeTags` / `excludeTags` return lambdas that are the real strategies (lines 134-139, 154-159). |
| `TestDescriptor.Visitor` + `accept` (`TestDescriptor.java:345-383`) | GoF Visitor | No double dispatch. `Visitor` has a single `visit(TestDescriptor)` method, not one per node type, and `accept` does the traversal itself (`visitor.visit(this); children.forEach(child -> child.accept(visitor))`). It is a **tree-walk callback**, closer to an internal iterator. Visitors that need the concrete type use `instanceof` (e.g. `descriptor instanceof Validatable` in `DiscoverySelectorResolver`). |
| `CompositeTestDescriptorVisitor` (`junit-platform-engine/.../CompositeTestDescriptorVisitor.java:20`) | Composite | Structurally it implements `Visitor` and holds `Visitor`s, but there is no part-whole tree. It runs several callbacks in sequence on one node (lines 36-39). It is a **multicaster**, or a "composite function". It is Composite in form only. |
| `CompositeLauncherDiscoveryListener` | Composite | Same as above: a **broadcaster** that forwards each event to a list of listeners. It is the dispatch half of the Observer in section 4, not a part-whole hierarchy. |
| `DelegatingLauncherDiscoveryRequest` (`junit-platform-launcher/.../core/DelegatingLauncherDiscoveryRequest.java:27`) | Adapter (it wraps another object) | It implements the **same** interface it wraps (`LauncherDiscoveryRequest`) and forwards every call (lines 37-73), so no interface is converted. `EngineDiscoveryOrchestrator.java:110-115` subclasses it anonymously to replace only `getDiscoveryListener()`. That makes it a **forwarding wrapper / Decorator**, not an Adapter. |
| `TestIdentifier` / `TestPlan` (`junit-platform-launcher/.../TestIdentifier.java`, `TestPlan.java:89-95`) | Adapter or Proxy for `TestDescriptor` | `TestIdentifier.from(descriptor)` **copies** the descriptor's data into an immutable, serializable value object. It keeps no reference to the descriptor and delegates nothing. It is a **snapshot / Data Transfer Object**, not an Adapter or Proxy. |
| `CompositeFilter` | — | A real (flat) Composite, see section 1. The name is accurate. |

---

## How the patterns fit together in one discovery run

1. `EngineDiscoveryOrchestrator` assembles discovery listeners into one composite and fires `launcherDiscoveryStarted` (**Observer**).
2. Each engine's `EngineDiscoveryRequestResolution` tries pluggable `SelectorResolver`s (**Strategy**, first success wins) and fires `selectorProcessed` (**Observer**). It builds the `TestDescriptor` tree (**Composite**).
3. Ordering visitors wrap descriptors as `ClassDescriptor` / `MethodDescriptor` for user orderers (**Adapter**), using a fixed ordering algorithm with one hook (**Template Method**).
4. The orchestrator merges all `PostDiscoveryFilter`s into one with `composeFilters` (**Composite**) and applies it to each node (**Strategy**), walking the tree with `accept` (**Composite**).
5. `prune()` walks the tree once more and removes empty containers (**Composite**). Later, at execution time, `JupiterTestDescriptor.getExecutionMode()` picks each node's parallel mode (**Template Method**).
