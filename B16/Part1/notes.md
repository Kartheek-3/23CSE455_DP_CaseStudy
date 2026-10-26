# Part 1 notes – B16 (JUnit 6.1.3, commit f59f60d)

Source inspected: data/code/ (same files as GitHub at f59f60d). Line numbers checked with Part1/evidence/check_lines.py.

## Area A – Test discovery and the test descriptor hierarchy

| # | Instance name | Pattern | Key roles -> class | Proof | Verdict |
|---|---|---|---|---|---|
| A1 | Test Descriptor Tree | Composite (Structural) | Component=TestDescriptor; Composite base=AbstractTestDescriptor; Composites=EngineDescriptor, ClassTestDescriptor, ...; Leaf=TestMethodTestDescriptor; Clients=EngineDiscoveryOrchestrator, NodeTestTask (execution, see Area B) | TestDescriptor.java:348 `child.accept(visitor)` | confirmed |
| A2 | Composed Discovery Filter | Composite (Structural) | Component=Filter; Composite=CompositeFilter; Leaves=filter lambdas / IncludeMethodFilter | CompositeFilter.java:62 `filter.apply(element)` | confirmed (overlaps A3) |
| A3 | Post-Discovery Filter Policies | Strategy (Behavioral) | Strategy=PostDiscoveryFilter; Concrete=TagFilter lambdas, Include/ExcludeMethodFilter, EngineFilter; Context=EngineDiscoveryOrchestrator.applyPostDiscoveryFilters | EngineDiscoveryOrchestrator.java:230 `postDiscoveryFilter.apply(descriptor)` | confirmed (overlaps A2) |
| A4 | Jupiter Descriptor Skeletons | Template Method (Behavioral) | Abstract=JupiterTestDescriptor (final getExecutionMode, getLegacyReportingName; copyIncludingDescendants + abstract withUniqueId); Concrete=ClassBasedTestDescriptor, MethodBasedTestDescriptor, ClassTestDescriptor, ... | JupiterTestDescriptor.java:163, 268 | confirmed |
| A5 | Child Ordering Skeleton | Template Method (Behavioral) | Abstract=AbstractOrderingVisitor.orderChildrenTestDescriptors; hook=shouldNonMatchingDescriptorsComeBeforeOrderedOnes; Concrete=ClassOrderingVisitor, MethodOrderingVisitor | AbstractOrderingVisitor.java:110, 126 | confirmed |
| A6 | Discovery Event Notification | Observer (Behavioral) | Observer=LauncherDiscoveryListener; Concrete=DiscoveryIssueCollector, ...; Subject=EngineDiscoveryOrchestrator (+ EngineDiscoveryRequestResolution); attach=DefaultLauncher.registerLauncherDiscoveryListeners | EngineDiscoveryOrchestrator.java:194-197 | confirmed |
| A7 | Orderer Descriptor Wrappers | Adapter (Structural) | Target=ClassDescriptor/MethodDescriptor; Adapter=DefaultClassDescriptor/DefaultMethodDescriptor; Adaptee=ClassBasedTestDescriptor/MethodBasedTestDescriptor; Client=user ClassOrderer/MethodOrderer | DefaultClassDescriptor.java:23-26 | confirmed |

### Decisions (human verification)
- Composite rule: a class counts as Composite only if it combines children of its own interface into one object that clients use in place of a single child AND combines the children's answers into one result. CompositeFilter passes (ANDs the children's FilterResults into one answer); CompositeTestDescriptorVisitor is rejected (only runs callbacks one after another, returns nothing). The same rule makes the Composite*Listener classes in Area C uncertain (they only broadcast).
- A2 and A3 are the same classes seen two ways; counted as 2 instances with an overlap note (Strategy = swapping filter rules, Composite = combining them).

### Rejected / uncertain (with reason)
- AbstractTestDescriptor – not Template Method: skeletal implementation, final getters (lines 120/140/150), no method calls an abstract step.
- TagFilter – not a Strategy itself: final static factory; the lambdas it returns are the strategies.
- TestDescriptor.Visitor – not GoF Visitor: one visit() method, no double dispatch.
- CompositeTestDescriptorVisitor – not Composite (see decision above).
- DelegatingLauncherDiscoveryRequest – not Adapter: same interface wrapped and forwarded (Decorator-style).
- TestIdentifier – not Adapter/Proxy: immutable snapshot, keeps no TestDescriptor reference (TestIdentifier.java:49-67).
- Filter.adaptFilter – uncertain Adapter: deprecated for removal, not used.

## Area B – Test engines and the execution lifecycle

| # | Instance name | Pattern | Key roles -> class | Proof | Verdict |
|---|---|---|---|---|---|
| B1 | Hierarchical Engine Execution Skeleton | Template Method (Behavioral) | Abstract=HierarchicalTestEngine; template=final execute(); primitive=abstract createExecutionContext; hooks=createExecutorService, createThrowableCollectorFactory; Concrete=JupiterTestEngine | HierarchicalTestEngine.java:53-59, 117 | confirmed (overlaps B2) |
| B2 | Engine Collaborator Factory Methods | Factory Method (Creational) | Creator=HierarchicalTestEngine; ConcreteCreator=JupiterTestEngine; Products=HierarchicalTestExecutorService, JupiterEngineExecutionContext, ThrowableCollector.Factory | JupiterTestEngine.java:80-100 | confirmed (overlaps B1) |
| B3 | Test Executor Services | Strategy (Behavioral) | Strategy=HierarchicalTestExecutorService; Concrete=SameThread/ForkJoinPool/WorkerThreadPool...; Context=HierarchicalTestExecutor, NodeTestTask | NodeTestTask.java:180 `executorService().invokeAll(children)` | confirmed |
| B4 | Parallelism Configuration Strategy | Strategy (Behavioral) | Strategy=ParallelExecutionConfigurationStrategy; Concrete=enum FIXED/DYNAMIC/CUSTOM; selection=getStrategy (default dynamic); Context=ParallelHierarchicalTestExecutorServiceFactory | DefaultParallelExecutionConfigurationStrategy.java:220-225 | confirmed |
| B5 | Intercepting Launcher Wrappers | Decorator (Structural) | Component=Launcher; ConcreteComponent=DefaultLauncher; Decorator=DelegatingLauncher; ConcreteDecorator=InterceptingLauncher; assembled in DefaultLauncherSession | DefaultLauncherSession.java:67-70 | confirmed |
| B6 | Engine Listener Wrappers | Decorator (Structural) | Component=EngineExecutionListener; Decorator=DelegatingEngineExecutionListener; Concrete=StackTracePruning..., OutcomeDelaying..., MemoryCleanupListener; assembler=EngineExecutionOrchestrator | EngineExecutionOrchestrator.java:149, 198, 253 | confirmed (also Area C) |
| B7 | Engine-to-Launcher Listener Adapter | Adapter (Structural) | Target=EngineExecutionListener; Adapter=ExecutionListenerAdapter; Adaptee=TestExecutionListener; Client=engine via NodeTestTask | ExecutionListenerAdapter.java:47 | confirmed (also Area C) |
| B8 | Execution Event Notification | Observer (Behavioral) | Subject=NodeTestTask (+ EngineExecutionOrchestrator for plan events); Observer=EngineExecutionListener | NodeTestTask.java:158, 209, 224 | confirmed (also Area C) |
| B9 | Node Execution Tasks | Command (Behavioral) | Command=TestTask; ConcreteCommand=NodeTestTask; Invoker=HierarchicalTestExecutorService implementations | HierarchicalTestExecutorService.java:88-114; NodeTestTask.java:46 | confirmed |
| B10 | No-op Node | Null Object (Behavioral) | Null object=NodeUtils.noOpNode returned by asNode for non-Node descriptors | NodeUtils.java:25-30 | confirmed (small) |

### Decisions (human verification)
- B1 and B2 use the same create* methods: counted as 2 instances with an overlap note (Template Method fixes the run order, Factory Method decides which objects are created) – same rule as A2/A3.
- The execution-time task tree (NodeTestTask creating child tasks) is not a new Composite instance: it is A1 with NodeTestTask as a second client.
- B6, B7 and B8 are listener/reporting classes: counted here in Area B where first found and marked "also Area C"; the Area C prompt must not count them again.

### Rejected / uncertain (with reason)
- NodeTestTask + Node (Node lifecycle hooks) – UNCERTAIN Template Method: fixed step order, but the skeleton calls a separate Node object (delegation), not subclass hooks.
- TestEngine – not Strategy: plug-in SPI; the orchestrator runs every engine (EngineExecutionOrchestrator.java:188), none is chosen.
- ParallelHierarchicalTestExecutorServiceFactory – not Factory Method: static factory with private constructor and switch (lines 86-93).
- ClosedLauncher – not Null Object: every method throws (fail-fast sentinel).
- EngineExecutionOrchestrator – not Mediator: controller running a fixed sequence.
- LauncherStoreFacade – not Facade: holds two stores and creates NamespaceAwareStore adapters.
- HierarchicalTestExecutor – not Strategy/Facade: one-shot coordinator that builds and submits the root task.

## Area C – Execution listeners and result reporting

| # | Instance name | Pattern | Key roles -> class | Proof | Verdict |
|---|---|---|---|---|---|
| C1 | Test Execution Listeners (client side) | Observer (Behavioral) | Observer=TestExecutionListener; Concrete=SummaryGeneratingListener, LoggingListener, UniqueIdTrackingListener, FlightRecordingExecutionListener, StreamInterceptingTestExecutionListener; attach=DefaultLauncher.registerTestExecutionListeners, ServiceLoader (LauncherFactory), per-request registry; notify=CompositeTestExecutionListener.notifyEach; Subject=EngineExecutionOrchestrator (+ events adapted by B7) | CompositeTestExecutionListener.java:104-112 (catches each listener's Throwable) | confirmed (new vs B8: client side) |
| C2 | Launcher Session Notification | Observer (Behavioral) | Observer=LauncherSessionListener; Subject=DefaultLauncherSession; multicaster=CompositeLauncherSessionListener | DefaultLauncherSession.java:71, 87 | confirmed (small) |
| C3 | Listener Notification Order | Strategy (Behavioral) | Strategy=IterationOrder (abstract forEach); Concrete=ORIGINAL, REVERSED; Context=notifyEach in CompositeTestExecutionListener / CompositeEngineExecutionListener | IterationOrder.java:18-34 | confirmed (small) |
| C4 | Pluggable Log Sink | Strategy (Behavioral) | Strategy=BiConsumer<Throwable, Supplier<String>>; Concrete=java.util.logging lambda (forJavaUtilLogging) or user-supplied (forBiConsumer); Context=LoggingListener | LoggingListener.java:62-88 | confirmed (small) |
| C5 | Test Reporter Adapter | Adapter (Structural) | Target=TestReporter; Adapter=DefaultTestReporter; Adaptee=ExtensionContext.publishReportEntry (AbstractExtensionContext); Client=user test method | DefaultTestReporter.java:33-34 | confirmed |
| C6 | Captured Output Stream | Decorator (Structural) | Component=PrintStream; ConcreteComponent=original System.out/err; Decorator=StreamInterceptor; installed by StreamInterceptingTestExecutionListener | StreamInterceptor.java:84-90 (copies then super.write) | confirmed |
| C7 | No-op Listeners | Null Object (Behavioral) | EngineExecutionListener.NOOP, LauncherSessionListener.NOOP returned when no listener is registered | LauncherSessionListeners.java:36-37 | confirmed (small) |

### Decisions (human verification)
- Composite*Listener classes (CompositeTestExecutionListener, CompositeEngineExecutionListener, CompositeLauncherSessionListener): UNCERTAIN Composite, not counted – flat multicasters that only broadcast (see Composite rule in Area A).
- C1 is a new Observer instance, separate from B8 (B8 = engine-side EngineExecutionListener events; C1 = client-side TestExecutionListener with its own registration and concrete listeners).
- C2 counted separately: different observer interface and different subject.
- Strategy: C3 and C4 counted; ListenerRegistry's composite factory (Function<List<T>,T>) recorded as UNCERTAIN (closer to an injected factory).
- C7 is a different collaboration from B10 (listener NOOPs vs no-op Node).

### Rejected / uncertain (with reason)
- Template Method – rejected for listeners/TestReporter/TestExecutionSummary: only optional callbacks and convenience overloads, no skeleton.
- FlightRecordingExecutionListener, LoggingListener as Adapter – UNCERTAIN: they are observers that use JFR / logging.
- ListenerRegistry composite factory as Strategy – UNCERTAIN (see above).
- ListenerRegistry / LauncherListenerRegistry – not Registry/Service Locator: per-run list builders, no lookup by key.
- MutableTestExecutionSummary – not Builder: read-only interface over a mutable object.
- ReportEntry – not Builder: value object with static factory methods.
- LoggingListener.forJavaUtilLogging/forBiConsumer – not Factory Method: static factories.
- StreamInterceptingTestExecutionListener – not Interceptor: an (eager) observer.
- UniqueIdTrackingListener – not State: a boolean flag.

## Area D – Jupiter extensions and resource management

| # | Instance name | Pattern | Key roles -> class | Proof | Verdict |
|---|---|---|---|---|---|
| D1 | Temp Directory Creation | Strategy (Behavioral) | Strategy=TempDirFactory; Concrete=TempDirFactory.Standard or user factory; selection=TempDirectory.determineTempDirFactory | TempDirectory.java:194-199 | confirmed |
| D2 | Temp Directory Deletion | Strategy (Behavioral) | Strategy=TempDirDeletionStrategy; Concrete=IgnoreFailures, Standard; selection=TempDirectory.determineDeletionStrategy; used in Cleanup.run | TempDirectory.java:187, 349 | confirmed |
| D3 | Parameter Resolution | Strategy (Behavioral) | Strategy=ParameterResolver; Concrete=TempDirectory, TestInfoParameterResolver, TestReporterParameterResolver; Context=ParameterResolutionUtils.resolveParameter (exactly one must support) | ParameterResolutionUtils.java:132-155 | confirmed |
| D4 | Conditional Execution | Strategy (Behavioral) | Strategy=ExecutionCondition; Concrete=DisabledCondition (+ @EnabledOn/@DisabledIf conditions); Context=ConditionEvaluator (first disabled wins) | ConditionEvaluator.java:52-57 | confirmed |
| D5 | Store Close Action | Strategy (Behavioral) | Strategy=NamespacedHierarchicalStore.CloseAction; Concrete=lambda from AbstractExtensionContext.createCloseAction; Context=NamespacedHierarchicalStore.close | AbstractExtensionContext.java:92-120 | confirmed (small) |
| D6 | Extension Store Adapter | Adapter (Structural) | Target=ExtensionContext.Store; Adapter=NamespaceAwareStore; Adaptee=NamespacedHierarchicalStore; created by LauncherStoreFacade.getStoreAdapter; Client=AbstractExtensionContext.getStore | NamespaceAwareStore.java:44, 122-123 | confirmed |
| D7 | Lifecycle Method Adapters | Adapter (Structural) | Target=BeforeEachMethodAdapter/AfterEachMethodAdapter (extend Extension); Adaptee=user @BeforeEach/@AfterEach Method; Adapter=lambdas from ClassBasedTestDescriptor.synthesize*MethodAdapter; Client=TestMethodTestDescriptor.invokeBeforeEachMethods | ClassBasedTestDescriptor.java:529-535 | confirmed |
| D8 | Test Outcome Watchers | Observer (Behavioral) | Observer=TestWatcher; Concrete=RepetitionExtension / user watchers; Subject=MethodBasedTestDescriptor.invokeTestWatchers (from nodeFinished/nodeSkipped) | MethodBasedTestDescriptor.java:169-187 | confirmed |
| D9 | Invocation Interceptor Chain | Chain of Responsibility (Behavioral) | Handler=InvocationInterceptor; Concrete=TimeoutExtension / user interceptors; link=InterceptedInvocation; request=Invocation (proceed/skip); builder=InvocationInterceptorChain; Client=InterceptingExecutableInvoker | InvocationInterceptorChain.java:56-59 | confirmed (interceptor-chain variant) |
| D10 | Timeout Invocation Wrappers | Decorator (Structural) | Component=Invocation; Decorators=SameThreadTimeoutInvocation, SeparateThreadTimeoutInvocation, ValidatingInvocation; built by TimeoutExtension.decorate / TimeoutInvocationFactory | SameThreadTimeoutInvocation.java:28, 51 | confirmed |
| D11 | Packaged Reflective Calls | Command (Behavioral) | Command=Invocation; Concrete=MethodInvocation, ConstructorInvocation; created by InterceptingExecutableInvoker; run/skip by interceptors | InterceptingExecutableInvoker.java:97; MethodInvocation.java:59-61 | confirmed (small) |

### Decisions (human verification)
- All five Strategy uses (D1-D5) are independent collaborations (create, delete, resolve, decide, close) and are counted separately; D5 is small.
- D10 (Decorator) and D9 (Chain of Responsibility) share the Invocation interface but are different collaborations: D9 builds the chain, D10 wraps one invocation with a timeout.
- D11 uses different classes from B9, so it is a separate Command instance.

### Rejected / uncertain (with reason)
- Lifecycle callbacks (BeforeEachCallback, AfterEachCallback, ...) as Observer – UNCERTAIN: they can fail the test or inject fields, so they are hooks rather than passive observers (CallbackSupport.java:33-36).
- NamespacedHierarchicalStore parent lookup as Chain of Responsibility – UNCERTAIN: CoR-shaped, but really a scoped lookup (lines 465-471).
- AbstractExtensionContext.getExecutionMode -> getPlatformExecutionMode – UNCERTAIN Template Method: only one step, not counted.
- CallbackSupport – not Template Method: static helper taking a lambda.
- ExtensionContext / NamespacedHierarchicalStore / MutableExtensionRegistry – not Composite: parent links only, no children.
- TempDirFactory – not Factory Method (it is a creation strategy, D1); TimeoutInvocationFactory – simple factory.
- CleanupMode – not Strategy/State: enum flag checked with an if.
- ConditionEvaluator, ParameterResolutionUtils – not Chain of Responsibility: they loop over strategies.
- AutoCloseExtension – not Adapter: a callback extension; CloseablePath – not Proxy: resource holder.
