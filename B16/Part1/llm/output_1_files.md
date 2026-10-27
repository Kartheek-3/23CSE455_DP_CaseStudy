<!-- Raw output of Part 1, prompt 1 (Part1/llm/prompt_1_files.txt). Copied verbatim from the Claude chat:
     section 1 = the chat reply, section 2 = the attached file junit-file-map.md. -->

# 1. Chat reply

The file map is in [junit-file-map.md](/mnt/project-files/junit-case-study/junit-file-map.md). I built it from the source at commit f59f60d, and it covers only `src/main/java` in your four modules.

It starts with one walkthrough of a single `@Test` going through all four areas. Then each area gets its own section with three parts:
- **Files**: full repository paths, each with a one-line role.
- **How it connects**: how the area fits with the other three and with the launcher.
- **Flow**: the test traced step by step through that area, naming the real methods along the way.

These are the four places where the areas join:
- **A and B:** discovery and execution use the same tree. `JupiterTestDescriptor` is a `TestDescriptor` (A) and also a `Node` (B), so the engine runs the tree discovery built without converting it.
- **B and D:** `NodeTestTask` calls `prepare → before → execute → after → cleanUp` on each node. Jupiter places every extension callback inside those calls.
- **B and C:** execution and reporting meet at `ExecutionListenerAdapter`. It turns the engine's `TestDescriptor` events into the `TestIdentifier` events that IDEs and build tools receive.
- **D and the launcher:** resources are cleaned up through three nested stores (session, request and per-test). Closing a store closes the `@TempDir` and `@AutoClose` resources kept in it.

# 2. Attached file: junit-file-map.md

# JUnit 6.1.3 file map for the design patterns case study

Commit: `f59f60d2cebdf2224235d81f781b1f310cbc8138` ("Release 6.1.3")
Scope: `src/main/java` in `junit-platform-engine`, `junit-platform-launcher`, `junit-jupiter-api`, `junit-jupiter-engine`.

All paths below are full repository paths. Every claim about call order was read from the source at that commit (method names are given so you can jump to them).

---

## 0. The big picture

JUnit is split into two layers:

| Layer | Modules | Role |
|---|---|---|
| **Platform** | `junit-platform-engine`, `junit-platform-launcher` | A generic test-running runtime. It knows nothing about `@Test`. It defines the `TestEngine` SPI, the `TestDescriptor` tree, and the `Launcher` that IDEs and build tools call. |
| **Jupiter** | `junit-jupiter-api`, `junit-jupiter-engine` | The JUnit 5/6 programming model. `junit-jupiter-api` is what test authors compile against (`@Test`, `Assertions`, extension interfaces). `junit-jupiter-engine` is a `TestEngine` implementation that turns those annotations into descriptors and runs them. |

The dependency direction is strictly one way:

```
IDE / Gradle / Maven / Console
        │  (LauncherDiscoveryRequest, TestExecutionListener)
        ▼
junit-platform-launcher  ──uses──►  junit-platform-engine  (TestEngine SPI, TestDescriptor, EngineExecutionListener)
                                            ▲
                                            │ implements
                                    junit-jupiter-engine  ──uses──►  junit-jupiter-api  (annotations, Extension SPI)
                                                                            ▲
                                                                            │ compiles against
                                                                     user test code
```

The launcher finds engines with `java.util.ServiceLoader`, so it never references `JupiterTestEngine` directly.

### End-to-end flow of one test (summary)

Take `class CalcTest { @BeforeEach void setUp(){} @Test void adds(){} }` run from an IDE.

1. **Bootstrap.** The IDE calls `LauncherFactory.openSession()` / `create()`. Engines, post-discovery filters, and listeners are loaded via `ServiceLoader`. A `DefaultLauncher` is built with a session-level `NamespacedHierarchicalStore`.
2. **Request.** The IDE builds a `LauncherDiscoveryRequest` with `LauncherDiscoveryRequestBuilder` (selectors such as `selectClass(CalcTest.class)`, filters, config parameters).
3. **Discovery (Area A).** `DefaultLauncher.execute(...)` → `EngineDiscoveryOrchestrator.discover(...)` → for each engine `TestEngine.discover(request, uniqueId)`. Jupiter's `JupiterTestEngine.discover` creates a `JupiterEngineDescriptor` and runs `DiscoverySelectorResolver` → `EngineDiscoveryRequestResolver` → `ClassSelectorResolver` / `MethodSelectorResolver`, producing the tree `JupiterEngineDescriptor → ClassTestDescriptor(CalcTest) → TestMethodTestDescriptor(adds)`. The launcher then applies `PostDiscoveryFilter`s (e.g. tags), prunes empty containers, and wraps everything in a `TestPlan` of `TestIdentifier`s.
4. **Execution (Area B).** `EngineExecutionOrchestrator.execute(...)` builds the listener chain, then calls `TestEngine.execute(ExecutionRequest)`. `JupiterTestEngine` inherits `HierarchicalTestEngine.execute`, which creates a `HierarchicalTestExecutor`; it wraps each descriptor in a `NodeTestTask` and walks the tree calling the `Node` lifecycle: `prepare → shouldBeSkipped → before → execute → (children) → after → cleanUp`.
5. **Jupiter lifecycle + extensions (Area D).** Each Jupiter descriptor implements `Node`: the engine descriptor creates the root `MutableExtensionRegistry` with built-in extensions; `ClassTestDescriptor` registers class-level extensions, creates the instance, runs `BeforeAllCallback`s and `@BeforeAll`; `TestMethodTestDescriptor` runs `BeforeEachCallback` → `@BeforeEach` → `BeforeTestExecutionCallback` → the `@Test` method via `InterceptingExecutableInvoker` (parameter resolution + `InvocationInterceptor` chain) → the "after" mirror → `TestWatcher`. Each level has an `ExtensionContext` with its own `Store`; stores are closed in `cleanUp`, which releases resources.
6. **Reporting (Area C).** At every step `NodeTestTask` calls `EngineExecutionListener.executionStarted/Skipped/Finished`. The launcher's chain (`OutcomeDelayingEngineExecutionListener` → `StackTracePruningEngineExecutionListener` → composite → `ExecutionListenerAdapter`) converts `TestDescriptor` to `TestIdentifier` and forwards to every `TestExecutionListener` (the IDE's own, `SummaryGeneratingListener`, `LoggingListener`, …).

The sections below expand each step.

---

## A. Test discovery and the test descriptor hierarchy

### What it is
Discovery turns *selectors* ("this class", "this package", "this unique ID") into a tree of `TestDescriptor`s, one tree per engine. The platform owns the tree model and a reusable resolution algorithm; Jupiter plugs in resolvers that understand its annotations. The launcher then filters, prunes, and exposes the tree to clients as a read-only `TestPlan`.

### Files

**Core model and request (platform engine)**

| File | Role |
|---|---|
| `junit-platform-engine/src/main/java/org/junit/platform/engine/TestDescriptor.java` | The node interface of the tree (parent/children, `getUniqueId`, `getType` CONTAINER/TEST, `accept(Visitor)`, `prune`, `removeFromHierarchy`). Contains the nested `Visitor` interface. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/CompositeTestDescriptorVisitor.java` | Combines several `TestDescriptor.Visitor`s into one. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/UniqueId.java` | Hierarchical ID such as `[engine:junit-jupiter]/[class:CalcTest]/[method:adds()]`. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/UniqueIdFormat.java` | Parses and formats `UniqueId` strings. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/TestSource.java` | Where a test came from (class, method, file, URI). |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/TestTag.java` | Tags attached to descriptors, used by tag filters. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/EngineDiscoveryRequest.java` | What an engine receives: selectors, filters, config, discovery listener. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/DiscoverySelector.java` | Marker interface for all selectors. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/DiscoverySelectorIdentifier.java` | String form of a selector (e.g. `class:com.x.CalcTest`). |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/Filter.java`, `.../FilterResult.java`, `.../CompositeFilter.java`, `.../DiscoveryFilter.java` | Generic filter abstraction and composition; `DiscoveryFilter` is applied by engines during discovery. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/EngineDiscoveryListener.java` | Callback for selector processing and discovery issues. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/SelectorResolutionResult.java` | Resolved / unresolved / failed status per selector. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/DiscoveryIssue.java`, `.../DefaultDiscoveryIssue.java` | Warnings/errors found during discovery (e.g. invalid `@Test` method). |

**Selectors and discovery filters** (`junit-platform-engine/src/main/java/org/junit/platform/engine/discovery/`)

| File | Role |
|---|---|
| `.../discovery/DiscoverySelectors.java` | Static factory for all selectors (`selectClass`, `selectMethod`, `selectPackage`, …). |
| `.../discovery/ClassSelector.java`, `MethodSelector.java`, `NestedClassSelector.java`, `NestedMethodSelector.java`, `PackageSelector.java`, `ClasspathRootSelector.java`, `ClasspathResourceSelector.java`, `ModuleSelector.java`, `FileSelector.java`, `DirectorySelector.java`, `UriSelector.java`, `UniqueIdSelector.java`, `IterationSelector.java` | Concrete selector value objects. |
| `.../discovery/DiscoverySelectorIdentifierParser.java`, `DiscoverySelectorIdentifierParsers.java` | Parse `prefix:value` strings back into selectors (pluggable via ServiceLoader). |
| `.../discovery/FilePosition.java` | Line/column in a file selector. |
| `.../discovery/ClassNameFilter.java`, `AbstractClassNameFilter.java`, `IncludeClassNameFilter.java`, `ExcludeClassNameFilter.java` | Regex filters on class names. |
| `.../discovery/PackageNameFilter.java`, `IncludePackageNameFilter.java`, `ExcludePackageNameFilter.java` | Filters on package names. |

(Full prefix for the rows above: `junit-platform-engine/src/main/java/org/junit/platform/engine/discovery/`.)

**Reusable descriptor base classes** (`junit-platform-engine/src/main/java/org/junit/platform/engine/support/descriptor/`)

| File | Role |
|---|---|
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/descriptor/AbstractTestDescriptor.java` | Base implementation of `TestDescriptor` (children set, parent pointer, unique ID, display name). |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/descriptor/EngineDescriptor.java` | Generic root descriptor for an engine. |
| `.../support/descriptor/ClassSource.java`, `MethodSource.java`, `PackageSource.java`, `FileSource.java`, `DirectorySource.java`, `FileSystemSource.java`, `ClasspathResourceSource.java`, `UriSource.java`, `DefaultUriSource.java`, `CompositeTestSource.java`, `FilePosition.java` | `TestSource` implementations. |

**Reusable resolution algorithm** (`junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/`)

| File | Role |
|---|---|
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/EngineDiscoveryRequestResolver.java` | Builder-configured entry point: register `SelectorResolver`s and post-resolution `TestDescriptor.Visitor`s, then `resolve(request, engineDescriptor, issueReporter)`. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/EngineDiscoveryRequestResolution.java` | The work-queue algorithm: `run()` polls selectors, asks each resolver in turn, adds matched descriptors to their parent, enqueues child selectors from `Match.expand()`, and finally applies the visitors. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/SelectorResolver.java` | SPI with one `resolve(XxxSelector, Context)` overload per selector type; nested types `Resolution`, `Match`, `Context`. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/ClassContainerSelectorResolver.java` | Turns package / classpath-root / module selectors into class selectors by scanning. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/ResourceContainerSelectorResolver.java`, `ResourceUtils.java` | Same idea for classpath resources. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/discovery/DiscoveryIssueReporter.java` | Reports `DiscoveryIssue`s to the discovery listener (with deduplicating / forwarding decorators). |

**Jupiter discovery** (`junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/`)

| File | Role |
|---|---|
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/DiscoverySelectorResolver.java` | Configures the platform `EngineDiscoveryRequestResolver` for Jupiter: class-container resolver, `ClassSelectorResolver`, `MethodSelectorResolver`, plus visitors for class ordering, method ordering, and validation. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/ClassSelectorResolver.java` | Resolves class / nested-class / unique-ID / iteration selectors into `ClassTestDescriptor`, `NestedClassTestDescriptor`, `ClassTemplateTestDescriptor`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/MethodSelectorResolver.java` | Resolves method selectors; a `MethodType` table maps predicates to factories: `IsTestMethod → TestMethodTestDescriptor`, `IsTestFactoryMethod → TestFactoryTestDescriptor`, `IsTestTemplateMethod → TestTemplateTestDescriptor`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/MethodSegmentResolver.java` | Builds/parses the `method:name(params)` unique-ID segment. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/DeclaredMethodSelector.java` | Internal selector for a method already reflected. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/AbstractOrderingVisitor.java`, `ClassOrderingVisitor.java`, `MethodOrderingVisitor.java` | Post-resolution visitors that reorder children per `@TestClassOrder` / `@TestMethodOrder`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/AbstractAnnotatedDescriptorWrapper.java`, `DefaultClassDescriptor.java`, `DefaultMethodDescriptor.java`, `DefaultClassOrdererContext.java`, `DefaultMethodOrdererContext.java` | Adapters exposing descriptors to user-supplied `ClassOrderer` / `MethodOrderer`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/discovery/predicates/IsTestableMethod.java`, `IsTestMethod.java`, `IsTestFactoryMethod.java`, `IsTestTemplateMethod.java`, `TestClassPredicates.java` | Predicates that decide whether a class/method is a test, and report discovery issues when it is malformed. |

**Jupiter descriptor hierarchy** (`junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/`)

| File | Role |
|---|---|
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/JupiterEngineDescriptor.java` | Root of Jupiter's tree; holds `JupiterConfiguration`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/JupiterTestDescriptor.java` | Abstract base of all Jupiter descriptors; `extends AbstractTestDescriptor implements Node<JupiterEngineExecutionContext>` (the bridge between Areas A and B). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ClassBasedTestDescriptor.java` | Base for class-level containers. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ClassTestDescriptor.java` | Top-level test class. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/NestedClassTestDescriptor.java` | `@Nested` inner class. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ClassTemplateTestDescriptor.java`, `ClassTemplateInvocationTestDescriptor.java` | `@ClassTemplate` container and each invocation. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/MethodBasedTestDescriptor.java` | Base for method-level descriptors. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/TestMethodTestDescriptor.java` | A plain `@Test` method (a TEST leaf). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/TestTemplateTestDescriptor.java`, `TestTemplateInvocationTestDescriptor.java` | `@TestTemplate` (e.g. `@RepeatedTest`, `@ParameterizedTest`) and its invocations, created at execution time. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/TestFactoryTestDescriptor.java` | `@TestFactory` method; emits dynamic children at execution time. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/DynamicNodeTestDescriptor.java`, `DynamicTestTestDescriptor.java`, `DynamicContainerTestDescriptor.java` | Descriptors for `DynamicTest` / `DynamicContainer`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/DynamicDescendantFilter.java`, `Filterable.java` | Restricts which dynamic children run when a unique-ID selector targets one. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/UniqueIdPrefixTransformer.java` | Rewrites unique IDs when descriptors are copied (class templates). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/DisplayNameUtils.java` | Computes display names via `@DisplayName` / `DisplayNameGenerator`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/MethodSourceSupport.java` | Builds `MethodSource`s. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/Validatable.java`, `TestClassAware.java`, `ResourceLockAware.java` | Small role interfaces mixed into descriptors. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/LifecycleMethodUtils.java` | Finds and validates `@BeforeAll` / `@BeforeEach` / etc. methods. |

**Jupiter API types that drive discovery** (`junit-jupiter-api/src/main/java/org/junit/jupiter/api/`)

`Test.java`, `TestFactory.java`, `TestTemplate.java`, `RepeatedTest.java`, `ClassTemplate.java`, `Nested.java`, `Tag.java`, `Tags.java`, `DisplayName.java`, `DisplayNameGeneration.java`, `DisplayNameGenerator.java`, `IndicativeSentencesGeneration.java`, `Order.java`, `TestMethodOrder.java`, `MethodOrderer.java`, `MethodOrdererContext.java`, `MethodDescriptor.java`, `TestClassOrder.java`, `ClassOrderer.java`, `ClassOrdererContext.java`, `ClassDescriptor.java`, `DynamicNode.java`, `DynamicTest.java`, `DynamicContainer.java`, `Named.java`, `NamedExecutable.java`, `RandomOrdererUtils.java` (all under `junit-jupiter-api/src/main/java/org/junit/jupiter/api/`).

**Launcher side of discovery** (`junit-platform-launcher/src/main/java/org/junit/platform/launcher/`)

| File | Role |
|---|---|
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherDiscoveryRequest.java` | Extends `EngineDiscoveryRequest` with engine filters and post-discovery filters. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/LauncherDiscoveryRequestBuilder.java` | Fluent builder clients use. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DefaultDiscoveryRequest.java` | Immutable request implementation. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DelegatingLauncherDiscoveryRequest.java` | Wrapper used to swap in the composite discovery listener. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineDiscoveryOrchestrator.java` | Runs discovery across engines: `discoverSafely` loops engines, calls `discoverEngineRoot` → `testEngine.discover(...)`, then `applyPostDiscoveryFilters` and `prune`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineDiscoveryResultValidator.java` | Checks the returned tree (no cycles, correct root). |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineIdValidator.java` | Rejects duplicate or reserved engine IDs. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineFilterer.java`, `junit-platform-launcher/src/main/java/org/junit/platform/launcher/EngineFilter.java` | Include/exclude whole engines. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/PostDiscoveryFilter.java` | Filter applied to the finished tree. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TagFilter.java` + `junit-platform-launcher/src/main/java/org/junit/platform/launcher/tagexpression/*.java` (`TagExpression`, `TagExpressions`, `Parser`, `Tokenizer`, `Token`, `TokenWith`, `ShuntingYard`, `Operator`, `Operators`, `Stack`, `DequeStack`, `ParseResult`, `ParseResults`, `ParseStatus`) | Tag-expression filtering (`fast & !slow`), parsed with a shunting-yard parser into a composite expression tree. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/MethodFilter.java`, `AbstractMethodFilter.java`, `IncludeMethodFilter.java`, `ExcludeMethodFilter.java` | Method-name post-discovery filters. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/LauncherDiscoveryResult.java` | Per-engine root descriptors + discovery issues. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TestPlan.java` | Client-facing tree; `TestPlan.from(...)` visits every descriptor and adds `TestIdentifier.from(descriptor)`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TestIdentifier.java` | Immutable, serializable snapshot of a `TestDescriptor`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/InternalTestPlan.java` | `TestPlan` that also keeps the `LauncherDiscoveryResult` for execution. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DiscoveryIssueCollector.java`, `DiscoveryIssueNotifier.java`, `DiscoveryIssueException.java`, `DiscoveryIssueReportingDiscoveryListener.java` | Collect discovery issues and fail/log them in the configured phase. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/LauncherPhase.java` | DISCOVERY vs EXECUTION phase. |

### How it interacts with the rest
- `TestDescriptor` is the shared currency of the whole system: discovery produces it (A), the executor walks it (B), listeners report on it (C), and Jupiter's extension contexts wrap it (D).
- `JupiterTestDescriptor` both *is* a `TestDescriptor` (A) and *is* a `Node` (B). That dual role is why the same tree built in discovery can be executed directly with no translation step.
- The launcher never sees Jupiter descriptor classes; it only sees `TestDescriptor` and, toward clients, `TestIdentifier`/`TestPlan`.

### Flow through Area A
1. `DefaultLauncher.discover(request)` or `execute(request)` → `EngineDiscoveryOrchestrator.discover(request, phase)`.
2. The orchestrator builds a composite `LauncherDiscoveryListener`, then for each non-excluded engine calls `discoverEngineRoot`, which computes `UniqueId.forEngine(id)` and calls `testEngine.discover(request, uniqueId)`.
3. `JupiterTestEngine.discover` builds `DefaultJupiterConfiguration` (wrapped in `CachingJupiterConfiguration`), creates `JupiterEngineDescriptor`, and calls `DiscoverySelectorResolver.resolveSelectors(...)`.
4. `EngineDiscoveryRequestResolution.run()` queues the request's selectors. For `ClassSelector(CalcTest)`, `ClassSelectorResolver.resolve` checks `TestClassPredicates`, then `context.addToParent(parent -> new ClassTestDescriptor(...))`. The returned `Match` expands into one `MethodSelector` per candidate method; those are queued.
5. `MethodSelectorResolver` matches `adds()` with `IsTestMethod` and creates `TestMethodTestDescriptor` under the class descriptor.
6. After the queue drains, the visitors run: `ClassOrderingVisitor`, `MethodOrderingVisitor`, and `Validatable.validate` (issues go to `DiscoveryIssueReporter`).
7. Back in the launcher: `EngineDiscoveryResultValidator.validate`, then `applyPostDiscoveryFilters` (e.g. `TagFilter`) removes excluded leaves, `prune` drops empty containers, and `InternalTestPlan.from(...)` → `TestPlan.from(...)` builds the client-facing tree.

---

## B. Test engines and the execution lifecycle

### What it is
`TestEngine` is the plug-in point: `discover(...)` and `execute(ExecutionRequest)`. The platform also ships an optional framework, `HierarchicalTestEngine`, that executes any tree whose nodes implement `Node`. Jupiter uses it, so Jupiter only has to say what each node does in `prepare/before/execute/after/cleanUp`; the framework handles ordering, skipping, error collection, parallelism, and locking.

### Files

**Engine SPI and requests (platform engine)**

| File | Role |
|---|---|
| `junit-platform-engine/src/main/java/org/junit/platform/engine/TestEngine.java` | The SPI: `getId`, `discover`, `execute`. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/ExecutionRequest.java` | What `execute` receives: root descriptor, `EngineExecutionListener`, config, output directory creator, request-level store, cancellation token. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/ConfigurationParameters.java` | Key/value config visible to engines. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/config/PrefixedConfigurationParameters.java` | View of config under a prefix (used for parallel config). |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/TestExecutionResult.java` | SUCCESSFUL / ABORTED / FAILED + throwable. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/CancellationToken.java`, `RegularCancellationToken.java`, `DisabledCancellationToken.java` | Cooperative cancellation of a run. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/OutputDirectoryCreator.java` | Engine-facing access to report output dirs. |

**Hierarchical execution framework** (`junit-platform-engine/src/main/java/org/junit/platform/engine/support/hierarchical/`)

| File | Role |
|---|---|
| `.../hierarchical/HierarchicalTestEngine.java` | Abstract engine. `execute(request)` is `final`: creates executor service, execution context, throwable-collector factory, then `new HierarchicalTestExecutor(...).execute().get()`. Subclasses override the `create*` hooks. |
| `.../hierarchical/HierarchicalTestExecutor.java` | Builds the root `NodeTestTask` and `NodeTestTaskContext`, submits it to the executor service. |
| `.../hierarchical/Node.java` | The lifecycle interface: `prepare`, `shouldBeSkipped`, `before`, `execute`, `after`, `around`, `cleanUp`, `nodeSkipped`, `nodeFinished`, `getExclusiveResources`, `getExecutionMode`; nested `DynamicTestExecutor`, `SkipResult`, `ExecutionMode`, `Invocation`. |
| `.../hierarchical/NodeTestTask.java` | Runs one node and recursively its children. `execute()` = `prepare` → `checkWhetherSkipped` → `executeRecursively` → `cleanUp` → `reportCompletion`. Inner `DefaultDynamicTestExecutor` handles children registered at run time. |
| `.../hierarchical/NodeTestTaskContext.java` | Shared state for all tasks (listener, executor service, collector factory, advisor, cancellation token). |
| `.../hierarchical/NodeUtils.java` | `asNode(descriptor)` cast helper. |
| `.../hierarchical/NodeTreeWalker.java`, `NodeExecutionAdvisor.java` | Pre-walk the tree to compute resource locks and forced execution modes. |
| `.../hierarchical/EngineExecutionContext.java` | Marker for the per-node context type `C`. |
| `.../hierarchical/ThrowableCollector.java`, `OpenTest4JAwareThrowableCollector.java` | Collects exceptions instead of letting them escape; classifies assumption failures as ABORTED. |
| `.../hierarchical/HierarchicalTestExecutorService.java` | Strategy interface (`submit`, `invokeAll`) with nested `TestTask`. |
| `.../hierarchical/SameThreadHierarchicalTestExecutorService.java` | Default sequential executor. |
| `.../hierarchical/ForkJoinPoolHierarchicalTestExecutorService.java`, `WorkerThreadPoolHierarchicalTestExecutorService.java`, `ParallelHierarchicalTestExecutorServiceFactory.java` | Parallel executors and the factory that picks one. |
| `.../hierarchical/ParallelExecutionConfiguration.java`, `ParallelExecutionConfigurationStrategy.java`, `DefaultParallelExecutionConfiguration.java`, `DefaultParallelExecutionConfigurationStrategy.java` | Parallelism settings (fixed / dynamic / custom). |
| `.../hierarchical/BlockingAwareFuture.java`, `DelegatingFuture.java` | Future wrappers for the parallel executors. |
| `.../hierarchical/ExclusiveResource.java`, `ResourceLock.java`, `SingleLock.java`, `CompositeLock.java`, `NopLock.java`, `LockManager.java` | Locks that serialize tests sharing a resource (`@ResourceLock`, `@Isolated`). |

(Full prefix for the rows above: `junit-platform-engine/src/main/java/org/junit/platform/engine/support/hierarchical/`.)

**Jupiter engine and its execution context**

| File | Role |
|---|---|
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/JupiterTestEngine.java` | `extends HierarchicalTestEngine<JupiterEngineExecutionContext>`; implements `discover`, and overrides `createExecutorService` (parallel if enabled), `createExecutionContext`, `createThrowableCollectorFactory`. Registered via `META-INF/services` / `module-info.java`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/Constants.java` | Config keys (parallel, lifecycle default, timeouts, …). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/config/JupiterConfiguration.java`, `DefaultJupiterConfiguration.java`, `CachingJupiterConfiguration.java`, `ConfigurationParameterConverter.java`, `EnumConfigurationParameterConverter.java`, `InstantiatingConfigurationParameterConverter.java`, `FilteringConfigurationParameterConverter.java` | Typed view over `ConfigurationParameters`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/JupiterEngineExecutionContext.java` | Immutable per-node context (`extend().with…().build()`): listener, configuration, `TestInstancesProvider`, `ExtensionRegistry`, `ExtensionContext`, `ThrowableCollector`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/TestInstancesProvider.java`, `DefaultTestInstances.java` | Lazily create/hold test instances (incl. outer instances for `@Nested`). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/ConditionEvaluator.java`, `ConditionEvaluationException.java` | Used by `JupiterTestDescriptor.shouldBeSkipped` to evaluate `ExecutionCondition`s. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/TestInstanceLifecycleUtils.java` | Resolves `@TestInstance(PER_CLASS / PER_METHOD)`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/TemplateExecutor.java` | Shared logic for expanding `@TestTemplate` / `@ClassTemplate` invocations through `DynamicTestExecutor`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ExclusiveResourceCollector.java` | Collects `@ResourceLock` declarations into `ExclusiveResource`s for `Node.getExclusiveResources`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/support/JupiterThrowableCollectorFactory.java`, `OpenTest4JAndJUnit4AwareThrowableCollector.java` | Jupiter's throwable collector (also treats JUnit 4 `AssumptionViolatedException` as aborted). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/support/MethodReflectionUtils.java` | Reflection helpers. |
| All Jupiter descriptors from Area A | Each implements the `Node` lifecycle; see the table below. |

**Jupiter API types that shape the lifecycle** (`junit-jupiter-api/src/main/java/org/junit/jupiter/api/`)

`BeforeAll.java`, `BeforeEach.java`, `AfterEach.java`, `AfterAll.java`, `TestInstance.java`, `Disabled.java`, `Timeout.java`, `TestInfo.java`, `RepetitionInfo.java`, `Assertions.java` and the `Assert*.java` helpers, `AssertionFailureBuilder.java`, `AssertionUtils.java`, `Assumptions.java`, `function/Executable.java`, `function/ThrowingSupplier.java`, `function/ThrowingConsumer.java`, `parallel/Execution.java`, `parallel/ExecutionMode.java`, `parallel/Isolated.java`, `parallel/ResourceLock.java`, `parallel/ResourceLocks.java`, `parallel/ResourceLocksProvider.java`, `parallel/ResourceAccessMode.java`, `parallel/ResourceLockTarget.java`, `parallel/Resources.java`, `timeout/PreemptiveTimeoutUtils.java` (prefix `junit-jupiter-api/src/main/java/org/junit/jupiter/api/`).

**Launcher side of execution**

| File | Role |
|---|---|
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/Launcher.java` | Client API: `discover`, `execute`, register listeners. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherSession.java`, `core/DefaultLauncherSession.java` | A session owns the session-level store and the interceptors; closing it closes the store. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/LauncherFactory.java` | Creates sessions/launchers; loads engines, filters, listeners, interceptors via `ServiceLoaderRegistry`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/LauncherConfig.java`, `DefaultLauncherConfig.java`, `LauncherConfigurationParameters.java`, `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherConstants.java` | Launcher configuration. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/ServiceLoaderTestEngineRegistry.java`, `ServiceLoaderRegistry.java`, `TestEngineFormatter.java` | Engine discovery on the classpath. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DefaultLauncher.java` | The real launcher: holds `EngineDiscoveryOrchestrator` and `EngineExecutionOrchestrator`; creates a request-level store per execution. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DelegatingLauncher.java`, `InterceptingLauncher.java`, `SessionPerRequestLauncher.java` | Decorators: wrap calls in `LauncherInterceptor`s, or open a fresh session per call. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherInterceptor.java`, `core/ClasspathAlignmentCheckingLauncherInterceptor.java`, `core/ClasspathAlignmentChecker.java` | Around-advice for launcher calls; the built-in one diagnoses mismatched JUnit jars. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherExecutionRequest.java`, `core/LauncherExecutionRequestBuilder.java`, `core/DefaultLauncherExecutionRequest.java` | Execution request (test plan or discovery request + listeners + cancellation token). |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/EngineExecutionOrchestrator.java` | Builds the listener chain, handles dry-run, then per engine `failOrExecuteEngine` → `executeEngine` → `testEngine.execute(ExecutionRequest.create(...))`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/IterationOrder.java` | Ordering helper for listeners. |

### Jupiter `Node` lifecycle per descriptor

| Descriptor | `prepare` | `before` | `execute` | `after` | `cleanUp` |
|---|---|---|---|---|---|
| `JupiterEngineDescriptor` | Creates root `MutableExtensionRegistry.createRegistryWithDefaultExtensions(...)` and `JupiterEngineExtensionContext`. | – | – | – | Closes the extension context (store). |
| `ClassBasedTestDescriptor` (`ClassTestDescriptor`, `NestedClassTestDescriptor`) | Child registry from `@ExtendWith` on the class, static `@RegisterExtension` fields, constructor/lifecycle-method parameter extensions, `@BeforeEach`/`@AfterEach` adapters, instance fields; resolves `TestInstanceFactory`; creates `ClassExtensionContext`. | If `PER_CLASS`, instantiate now; `BeforeAllCallback`s; `@BeforeAll` methods. | Inherited default (children run after this). | `@AfterAll` methods; `AfterAllCallback`s; `TestInstancePreDestroyCallback` if `PER_CLASS`. | Closes context; clears cached state. |
| `TestMethodTestDescriptor` | Child registry from method `@ExtendWith` + parameter extensions; `MethodExtensionContext`; gets test instance (creating it for `PER_METHOD`). | – | `BeforeEachCallback` → `@BeforeEach` (via `BeforeEachMethodAdapter`) → `BeforeTestExecutionCallback` → **test method** → `AfterTestExecutionCallback` → `@AfterEach` → `AfterEachCallback`. | – | `TestInstancePreDestroyCallback` if `PER_METHOD`; close context. `nodeFinished` notifies `TestWatcher`s. |
| `TestTemplateTestDescriptor` / `TestFactoryTestDescriptor` / `ClassTemplateTestDescriptor` | As above. | – | Ask providers / call factory, then register each child through `DynamicTestExecutor`. | – | – |

### How it interacts with the rest
- The launcher (`EngineExecutionOrchestrator`) is the only caller of `TestEngine.execute`; it passes the descriptor tree from Area A and the listener chain from Area C.
- `NodeTestTask` is where Area C events originate: it calls `executionStarted`, `executionSkipped`, `executionFinished`, `dynamicTestRegistered` on the `EngineExecutionListener` from the `ExecutionRequest`.
- `JupiterEngineExecutionContext` is how Area D (extensions, stores, instances) is threaded down the tree: each `prepare` returns an extended copy whose registry and extension context are children of the parent's.

### Flow through Area B
1. `DefaultLauncher.execute(InternalTestPlan, ...)` opens a request-level `NamespacedHierarchicalStore` (child of the session store) in try-with-resources and calls `EngineExecutionOrchestrator.execute`.
2. The orchestrator fires `testPlanExecutionStarted`, builds the engine listener chain, and for each engine calls `failOrExecuteEngine`: if discovery failed or there are critical discovery issues, the engine is reported failed; if cancelled, children are reported skipped; otherwise `executeEngine` calls `testEngine.execute(ExecutionRequest.create(...))`.
3. `HierarchicalTestEngine.execute` (final) → `createExecutorService` (Jupiter: parallel or same-thread) → `createExecutionContext` (Jupiter: new `JupiterEngineExecutionContext` with a `LauncherStoreFacade` over the request store) → `HierarchicalTestExecutor.execute()`.
4. `HierarchicalTestExecutor` runs `NodeTreeWalker.walk` to compute locks, then submits a root `NodeTestTask`.
5. `NodeTestTask.execute()` for the engine node → `prepare` → `shouldBeSkipped` → `executeRecursively`: fire `executionStarted`, call `node.around(ctx, …)`, inside it create child tasks, `node.before`, `node.execute`, `executorService.invokeAll(children)`, await dynamic children, `node.after`. Then `cleanUp` and `reportCompletion` (fires `executionFinished` with the collector's result).
6. Recursion repeats for `ClassTestDescriptor`, then `TestMethodTestDescriptor`. `shouldBeSkipped` for Jupiter nodes runs `ConditionEvaluator` over registered `ExecutionCondition`s (e.g. `DisabledCondition`); a skip produces `executionSkipped` and the subtree is never entered.
7. Every exception is caught by a `ThrowableCollector`; at the end it becomes a `TestExecutionResult` (FAILED, or ABORTED for assumption failures).
8. Back in the launcher, `OutcomeDelayingEngineExecutionListener.reportEngineOutcome()` emits the engine's own finished event, then `testPlanExecutionFinished` fires and the request store is closed.

---

## C. Execution listeners and result reporting

### What it is
Two listener interfaces exist on purpose. Engines talk to `EngineExecutionListener` in terms of `TestDescriptor`. Clients implement `TestExecutionListener` in terms of `TestPlan`/`TestIdentifier`. The launcher sits between them, adapting one to the other and fanning events out to many listeners, with decorators for stack-trace pruning, stream capture, memory cleanup, and JFR.

### Files

**Engine-facing (platform engine)**

| File | Role |
|---|---|
| `junit-platform-engine/src/main/java/org/junit/platform/engine/EngineExecutionListener.java` | `dynamicTestRegistered`, `executionStarted`, `executionSkipped`, `executionFinished`, `reportingEntryPublished`, `fileEntryPublished`; has a `NOOP` constant. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/TestExecutionResult.java` | The outcome carried by `executionFinished`. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/reporting/ReportEntry.java` | Key/value report entries (from `TestReporter.publishEntry`). |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/reporting/FileEntry.java` | Published file attachments. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/reporting/OutputDirectoryProvider.java`, `OutputDirectoryProviderAdapter.java` | Legacy output directory API adapted to `OutputDirectoryCreator`. |

**Client-facing (launcher)**

| File | Role |
|---|---|
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TestExecutionListener.java` | Client listener: `testPlanExecutionStarted/Finished`, `dynamicTestRegistered`, `executionStarted/Skipped/Finished`, `reportingEntryPublished`, `fileEntryPublished`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherDiscoveryListener.java` | Discovery-time events (`launcherDiscoveryStarted`, `engineDiscoveryStarted`, `selectorProcessed`, `issueEncountered`, …). |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/LauncherSessionListener.java` | Session open/close events. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/EngineDiscoveryResult.java` | Per-engine discovery outcome passed to discovery listeners. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/TestPlan.java`, `TestIdentifier.java` | What client listeners receive. |

**Listener plumbing in `launcher/core`**

| File | Role |
|---|---|
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/ListenerRegistry.java` | Generic registry that produces a composite listener of a given type. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/LauncherListenerRegistry.java` | Holds the discovery- and execution-listener registries for a `DefaultLauncher`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/CompositeTestExecutionListener.java` | Fans a `TestExecutionListener` call out to many; isolates failures of one listener. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/CompositeEngineExecutionListener.java` | Same for `EngineExecutionListener`. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/ExecutionListenerAdapter.java` | `implements EngineExecutionListener`, forwards to a `TestExecutionListener` after `testPlan.getTestIdentifier(descriptor.getUniqueId())`; adds dynamic tests to the plan. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DelegatingEngineExecutionListener.java` | Base decorator. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/OutcomeDelayingEngineExecutionListener.java` | Holds back the engine-level finished event until the engine returns, so engine failures can be merged in. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/StackTracePruningEngineExecutionListener.java` | Trims JUnit frames from failure stack traces (on by default). |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/MemoryCleanupListener.java` | Optional: drops references to finished descriptors. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/StreamInterceptingTestExecutionListener.java`, `StreamInterceptor.java` | Optional capture of `System.out/err` into report entries. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/DelegatingLauncherDiscoveryListener.java` | Base decorator for discovery listeners. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/core/HierarchicalOutputDirectoryCreator.java` | Creates per-test output directories. |

**Ready-made listeners**

| File | Role |
|---|---|
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/SummaryGeneratingListener.java` | Counts results into a summary. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/TestExecutionSummary.java`, `MutableTestExecutionSummary.java` | The summary model and its builder-like mutable implementation. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/LoggingListener.java` | Logs every event. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/UniqueIdTrackingListener.java`, `OutputDir.java` | Writes executed unique IDs to a file. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/discovery/LauncherDiscoveryListeners.java`, `AbortOnFailureLauncherDiscoveryListener.java`, `LoggingLauncherDiscoveryListener.java`, `CompositeLauncherDiscoveryListener.java` | Discovery listeners and their factory. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/listeners/session/LauncherSessionListeners.java`, `CompositeLauncherSessionListener.java` | Session listeners. |
| `junit-platform-launcher/src/main/java/org/junit/platform/launcher/jfr/FlightRecordingExecutionListener.java`, `FlightRecordingDiscoveryListener.java`, `JfrUtils.java`, `UniqueId.java` | Emit Java Flight Recorder events. |

**Jupiter producers of reporting events**

| File | Role |
|---|---|
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/TestReporter.java` | User API to publish entries/files. |
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/MediaType.java`, `junit-jupiter-api/src/main/java/org/junit/jupiter/api/extension/MediaType.java` | Media type for published files. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/TestReporterParameterResolver.java`, `DefaultTestReporter.java` | Inject a `TestReporter` that calls `ExtensionContext.publishReportEntry`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/AbstractExtensionContext.java` | `publishReportEntry` / `publishFile` call `engineExecutionListener.reportingEntryPublished` / `fileEntryPublished`. |
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/extension/TestWatcher.java` | Extension-level result observation (fired from `nodeFinished` / `nodeSkipped`). |

### How it interacts with the rest
- The only producer of execution events is the engine (via `NodeTestTask` for hierarchical engines). The launcher never decides outcomes itself, except when an engine fails as a whole or discovery fails.
- `ExecutionListenerAdapter` is the seam between the engine world (Area B, `TestDescriptor`) and the client world (`TestIdentifier`). It also keeps the `TestPlan` in sync when dynamic tests are registered during execution (e.g. `@TestFactory`, `@RepeatedTest`).
- `TestWatcher` (Area D) is a Jupiter-internal listener at extension level; `TestExecutionListener` is the platform-wide one.

### Flow through Area C
Listener chain built in `EngineExecutionOrchestrator` (outermost first, as the engine sees it):

```
NodeTestTask
  → OutcomeDelayingEngineExecutionListener        (executeEngine)
    → StackTracePruningEngineExecutionListener    (selectExecutionListener, if enabled)
      → [MemoryCleanupListener]                   (if enabled)
        → CompositeEngineExecutionListener        (ListenerRegistry.forEngineExecutionListeners)
            ├─ ExecutionListenerAdapter(testPlan, compositeTestExecutionListener)
            │     → CompositeTestExecutionListener
            │          ├─ listeners registered on the Launcher (ServiceLoader + registerTestExecutionListeners)
            │          ├─ listeners passed to this execute(...) call (the IDE's)
            │          └─ [StreamInterceptingTestExecutionListener]
            └─ parent EngineExecutionListener (NOOP normally; used by suite engine / testkit)
```

For `CalcTest.adds()` the client sees: `testPlanExecutionStarted` → `executionStarted(engine)` → `executionStarted(CalcTest)` → `executionStarted(adds())` → (`reportingEntryPublished` if the test publishes) → `executionFinished(adds(), SUCCESSFUL)` → `executionFinished(CalcTest)` → `executionFinished(engine)` (delayed until the engine returns) → `testPlanExecutionFinished`.

Discovery events flow similarly: `EngineDiscoveryOrchestrator.getLauncherDiscoveryListener` composes registered listeners + the request's listener + `DiscoveryIssueCollector`, wrapped in `DiscoveryIssueReportingDiscoveryListener`.

---

## D. Jupiter extensions and resource management

### What it is
Jupiter's extension model lets third-party code hook into every lifecycle point through small interfaces, all extending the marker `Extension`. Extensions are registered declaratively (`@ExtendWith`), programmatically (`@RegisterExtension` fields), automatically (ServiceLoader), or as built-ins. They are kept in a parent/child `ExtensionRegistry` that mirrors the descriptor tree, and they get state through an `ExtensionContext.Store` that is also hierarchical and closes its values when its scope ends. That store is the core of resource management (temp dirs, `@AutoClose`, `CloseableResource`, session/request-wide caches).

### Files

**Extension SPI** (`junit-jupiter-api/src/main/java/org/junit/jupiter/api/extension/`)

| File | Role |
|---|---|
| `.../extension/Extension.java` | Marker interface. |
| `.../extension/ExtendWith.java`, `Extensions.java`, `RegisterExtension.java` | Declarative / programmatic registration. |
| `.../extension/ExtensionContext.java` | Context passed to every callback: element, test class/method/instance, parent, tags, config, `publishReportEntry`, `getStore(...)`. Nested `Store`, `Namespace`, `StoreScope`. |
| `.../extension/BeforeAllCallback.java`, `AfterAllCallback.java`, `BeforeEachCallback.java`, `AfterEachCallback.java`, `BeforeTestExecutionCallback.java`, `AfterTestExecutionCallback.java` | Lifecycle callbacks. |
| `.../extension/BeforeClassTemplateInvocationCallback.java`, `AfterClassTemplateInvocationCallback.java`, `ClassTemplateInvocationLifecycleMethod.java` | Class-template callbacks. |
| `.../extension/ExecutionCondition.java`, `ConditionEvaluationResult.java` | Enable/disable decisions. |
| `.../extension/ParameterResolver.java`, `ParameterContext.java`, `ParameterResolutionException.java`, `support/TypeBasedParameterResolver.java` | Dependency injection into constructors and methods. |
| `.../extension/InvocationInterceptor.java`, `ReflectiveInvocationContext.java`, `DynamicTestInvocationContext.java` | Around-advice for every user method invocation. |
| `.../extension/TestInstanceFactory.java`, `TestInstanceFactoryContext.java`, `TestInstancePreConstructCallback.java`, `TestInstancePostProcessor.java`, `TestInstancePreDestroyCallback.java`, `TestInstantiationAwareExtension.java`, `TestInstances.java`, `TestInstantiationException.java` | Test-instance lifecycle hooks. |
| `.../extension/TestExecutionExceptionHandler.java`, `LifecycleMethodExecutionExceptionHandler.java` | Exception handling hooks. |
| `.../extension/TestWatcher.java` | Result observation. |
| `.../extension/TestTemplateInvocationContextProvider.java`, `TestTemplateInvocationContext.java`, `ClassTemplateInvocationContextProvider.java`, `ClassTemplateInvocationContext.java`, `TemplateInvocationValidationException.java` | Providers that expand templates (used by `@RepeatedTest`, `@ParameterizedTest`). |
| `.../extension/PreInterruptCallback.java`, `PreInterruptContext.java` | Called before a timed-out thread is interrupted. |
| `.../extension/ExecutableInvoker.java` | Lets extensions invoke methods with parameter resolution. |
| `.../extension/AnnotatedElementContext.java` | Shared base for field/parameter contexts (e.g. `TempDirFactory`). |
| `.../extension/ExtensionConfigurationException.java`, `ExtensionContextException.java` | Errors. |

(Full prefix: `junit-jupiter-api/src/main/java/org/junit/jupiter/api/extension/`.)

**Resource-related API** (`junit-jupiter-api/src/main/java/org/junit/jupiter/api/`)

| File | Role |
|---|---|
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/AutoClose.java` | Close a field after its scope. |
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/io/TempDir.java`, `TempDirFactory.java`, `CleanupMode.java`, `TempDirDeletionStrategy.java`, `DefaultDeletionResult.java` | Temporary directory injection and cleanup policy. |
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/condition/*.java` | Built-in conditions (`EnabledOnOs`, `DisabledIf`, `EnabledIfSystemProperty`, …) each paired with an `ExecutionCondition` implementation, sharing bases `AbstractOsBasedExecutionCondition`, `AbstractJreCondition`, `AbstractJreRangeCondition`, `AbstractRepeatableAnnotationCondition`, `BooleanExecutionCondition`, `MethodBasedCondition`. |
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/util/*.java` | Built-in extensions for global JVM state: `SystemPropertiesExtension` (`@SetSystemProperty`, `@ClearSystemProperty`, `@RestoreSystemProperties`), `DefaultLocaleExtension` (`@DefaultLocale`), `DefaultTimeZoneExtension` (`@DefaultTimeZone`), plus the `Reads*`/`Writes*` resource-lock annotations and providers (`LocaleProvider`, `TimeZoneProvider`, `NullLocaleProvider`, `NullTimeZoneProvider`, `JupiterLocaleUtils`, `JupiterPropertyUtils`). They save state in the `Store` before a test and restore it after. |
| `junit-jupiter-api/src/main/java/org/junit/jupiter/api/parallel/ResourceLock.java` and siblings | Declare shared resources so the executor (Area B `LockManager`) serializes access. |

**Registry and registration (Jupiter engine)**

| File | Role |
|---|---|
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/ExtensionRegistry.java` | Read side: `getExtensions(type)`, `getReversedExtensions(type)`, `stream(type)`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/ExtensionRegistrar.java` | Write side: `registerExtension`, `registerSyntheticExtension`, `registerUninitializedExtension`, `initializeExtensions`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/MutableExtensionRegistry.java` | Implements both. Root built by `createRegistryWithDefaultExtensions` (built-ins: `DisabledCondition`, `AutoCloseExtension`, `TimeoutExtension`, `RepeatedTestExtension`, `TestInfoParameterResolver`, `TestReporterParameterResolver`, `TempDirectory`; plus ServiceLoader auto-detected ones and `PreInterruptThreadDumpPrinter` when enabled). Children via `createRegistryFrom(parent, …)`; lookups walk up to the parent. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/ExtensionUtils.java` | Reads `@ExtendWith` / `@RegisterExtension` from classes, fields, parameters and registers them in order. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/CallbackSupport.java` | Invokes "before" callbacks in registration order and "after" callbacks in reverse. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/BeforeEachMethodAdapter.java`, `AfterEachMethodAdapter.java` | Wrap user `@BeforeEach`/`@AfterEach` methods as synthetic extensions so they run inside the callback ordering. |

**Extension contexts and stores**

| File | Role |
|---|---|
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/AbstractExtensionContext.java` | Base `ExtensionContext`: owns a `NamespacedHierarchicalStore` whose parent is the parent context's store (or the request-level store at the root); its close action closes `AutoCloseable` / `Store.CloseableResource` values. `getStore(StoreScope, …)` reaches session or request stores. `close()` closes the store. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/JupiterEngineExtensionContext.java`, `ClassExtensionContext.java`, `MethodExtensionContext.java`, `TestTemplateExtensionContext.java`, `DynamicExtensionContext.java`, `ClassTemplateInvocationExtensionContext.java` | One context type per descriptor type. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/ExtensionContextInternal.java` | Internal extension of `ExtensionContext` (e.g. access to the registry). |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/NamespaceAwareStore.java` | Adapts the platform `NamespacedHierarchicalStore` to Jupiter's `ExtensionContext.Store` for one namespace. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/LauncherStoreFacade.java` | Gives Jupiter access to the launcher's request-level and session-level stores. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/ExtensionContextSupplier.java` | Supplies the right context to `TestInstantiationAwareExtension`s depending on their configured scope. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/store/NamespacedHierarchicalStore.java` | The underlying store: parent-linked map keyed by (namespace, key); `close()` runs `CloseAction` on values in reverse insertion order. |
| `junit-platform-engine/src/main/java/org/junit/platform/engine/support/store/Namespace.java`, `NamespacedHierarchicalStoreException.java` | Platform namespace type and error. |

**Invocation, parameter resolution, instances**

| File | Role |
|---|---|
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/InterceptingExecutableInvoker.java` | Resolves parameters, then runs the call through the interceptor chain. Used for constructors, lifecycle methods, test methods, factories. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/InvocationInterceptorChain.java` | Builds nested `Invocation`s from all registered `InvocationInterceptor`s; `ValidatingInvocation` enforces exactly one `proceed()` or `skip()`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/MethodInvocation.java`, `ConstructorInvocation.java` | The innermost `Invocation` that performs the reflective call. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/ParameterResolutionUtils.java`, `DefaultParameterContext.java` | Find exactly one `ParameterResolver` per parameter. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/execution/DefaultExecutableInvoker.java` | Implementation of the API `ExecutableInvoker`. |
| `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/descriptor/DefaultTestInstanceFactoryContext.java`, `DefaultDynamicTestInvocationContext.java` | Context objects handed to extensions. |

**Built-in extensions** (`junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/`)

| File | Role |
|---|---|
| `.../extension/DisabledCondition.java` | `@Disabled` as an `ExecutionCondition`. |
| `.../extension/TempDirectory.java` | `@TempDir`: `BeforeAllCallback`, `BeforeEachCallback`, `ParameterResolver`. Stores a `CloseablePath` in the context store; when the store closes, the directory is deleted per `CleanupMode`. |
| `.../extension/AutoCloseExtension.java` | `@AutoClose` fields closed after all/each. |
| `.../extension/TimeoutExtension.java`, `TimeoutConfiguration.java`, `TimeoutDuration.java`, `TimeoutDurationParser.java`, `TimeoutExceptionFactory.java`, `TimeoutInvocationFactory.java`, `SameThreadTimeoutInvocation.java`, `SeparateThreadTimeoutInvocation.java` | `@Timeout` implemented as an `InvocationInterceptor` that wraps the invocation in a timed one. |
| `.../extension/PreInterruptCallbackInvocation.java`, `PreInterruptCallbackInvocationFactory.java`, `DefaultPreInterruptContext.java`, `PreInterruptThreadDumpPrinter.java` | Pre-interrupt hooks for timeouts. |
| `.../extension/RepeatedTestExtension.java`, `RepeatedTestInvocationContext.java`, `RepetitionExtension.java`, `DefaultRepetitionInfo.java`, `RepeatedTestDisplayNameFormatter.java` | `@RepeatedTest` as a `TestTemplateInvocationContextProvider`. |
| `.../extension/TestInfoParameterResolver.java` | Injects `TestInfo`. |
| `.../extension/TestReporterParameterResolver.java`, `DefaultTestReporter.java` | Injects `TestReporter`. |

### How it interacts with the rest
- **With Area B:** extensions are invoked from inside the `Node` methods of Jupiter descriptors. Each `prepare` builds a child `MutableExtensionRegistry` and a child `ExtensionContext`, and each `cleanUp` closes that context. Conditions are evaluated in `shouldBeSkipped`. `@ResourceLock` declarations become `ExclusiveResource`s consumed by the platform `LockManager`.
- **With Area A:** templates and factories create new descriptors at execution time and hand them to `DynamicTestExecutor`, which emits `dynamicTestRegistered`.
- **With Area C:** `ExtensionContext.publishReportEntry/publishFile` go straight to the `EngineExecutionListener`; `TestWatcher` is notified from `nodeFinished`/`nodeSkipped`.
- **With the launcher:** the three store scopes line up with platform lifetimes: `LAUNCHER_SESSION` = `DefaultLauncherSession` store, `EXECUTION_REQUEST` = the store `DefaultLauncher` opens per execution, `EXTENSION_CONTEXT` = a per-descriptor store whose parent chain ends at the request store.

### Flow through Area D (for `CalcTest.adds()` with `@ExtendWith(MyExt.class)` on the class and a `@TempDir Path dir` parameter)
1. **Engine `prepare`:** root registry with built-ins (`TempDirectory`, `TimeoutExtension`, …). `JupiterEngineExtensionContext` gets a store whose parent is the request-level store.
2. **Class `prepare`:** child registry; `MyExt` registered from `@ExtendWith`; static/instance `@RegisterExtension` fields; `@BeforeEach`/`@AfterEach` wrapped as `BeforeEachMethodAdapter`/`AfterEachMethodAdapter`. `ClassExtensionContext` with a child store.
3. **Class `shouldBeSkipped`:** `ConditionEvaluator` asks every `ExecutionCondition` (including `DisabledCondition`).
4. **Class `before`:** `BeforeAllCallback`s in registration order (built-ins first, then `MyExt`), then `@BeforeAll` via `InterceptingExecutableInvoker`.
5. **Method `prepare`:** child registry for method-level extensions; `MethodExtensionContext`; test instance created by `TestInstancesProvider` (`TestInstancePreConstructCallback` → constructor via invoker → `TestInstancePostProcessor`).
6. **Method `execute`:** `BeforeEachCallback`s → `@BeforeEach` → `BeforeTestExecutionCallback`s → test method: `ParameterResolutionUtils` asks resolvers; `TempDirectory.resolveParameter` creates the directory and puts a `CloseablePath` in the method context's store; `InvocationInterceptorChain` wraps the call (e.g. `TimeoutExtension`) → `MethodInvocation` reflects into `adds(dir)`. Exceptions go through `TestExecutionExceptionHandler`s. Then the "after" callbacks in reverse order.
7. **Method `nodeFinished`:** `TestWatcher.testSuccessful/Failed/Aborted`.
8. **Method `cleanUp`:** `TestInstancePreDestroyCallback`s (per-method lifecycle), then `context.close()` closes the store; the `CloseablePath` is closed, deleting the temp dir.
9. **Class `after`/`cleanUp`:** `@AfterAll`, `AfterAllCallback`s (reverse), class store closed (class-level `@TempDir`, `@AutoClose static` fields).
10. **Engine `cleanUp` and launcher:** engine store closed; the request-level store closes when `DefaultLauncher.execute` leaves its try-with-resources; the session store closes when the `LauncherSession` is closed.

---

## Cross-area cheat sheet

| Concept | Defined in | Produced by | Consumed by |
|---|---|---|---|
| `TestDescriptor` tree | `junit-platform-engine/.../engine/TestDescriptor.java` | Jupiter resolvers (A) | `NodeTestTask` (B), listeners (C), extension contexts (D) |
| `Node` lifecycle | `junit-platform-engine/.../support/hierarchical/Node.java` | Implemented by `JupiterTestDescriptor` and subclasses | `NodeTestTask` (B) |
| `EngineExecutionListener` | `junit-platform-engine/.../engine/EngineExecutionListener.java` | Called by `NodeTestTask`, `AbstractExtensionContext` | Launcher chain → `TestExecutionListener` (C) |
| `ExtensionRegistry` | `junit-jupiter-engine/.../extension/MutableExtensionRegistry.java` | Each descriptor's `prepare` (B/D) | `CallbackSupport`, `InterceptingExecutableInvoker`, `ConditionEvaluator` (D) |
| Stores | `junit-platform-engine/.../support/store/NamespacedHierarchicalStore.java` | Session (`DefaultLauncherSession`), request (`DefaultLauncher`), per context (`AbstractExtensionContext`) | Extensions via `ExtensionContext.getStore` (D) |
