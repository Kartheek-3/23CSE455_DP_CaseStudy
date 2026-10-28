"""Part 1 records for B16 (JUnit 6.1.3, commit f59f60d) - one entry per confirmed instance in Part1/notes.md.

Participant = (role, qualified symbol, path relative to data/code, token)
  - symbol with '#' is a method; token defaults to the last name part.
  - path None = JDK type (no file in the project).
Line ranges are NOT typed here: data/build_part1_csv.py finds them in the source.
"""
PE = "junit-platform-engine/src/main/java/org/junit/platform/engine/"
H = PE + "support/hierarchical/"
PL = "junit-platform-launcher/src/main/java/org/junit/platform/launcher/"
JA = "junit-jupiter-api/src/main/java/org/junit/jupiter/api/"
JE = "junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/"
D = JE + "descriptor/"

oj = "org.junit."


def p(role, symbol, path, token=None):
    return (role, symbol, path, token)


INSTANCES = [
    # ---------------- Area A ----------------
    dict(id="A1", name="Test Descriptor Tree", pattern="Composite", type="Structural", concrete=12,
         intent="Engines build one tree of TestDescriptor nodes (engine > class > nested class > method > dynamic test); "
                "the launcher filters, prunes, visits and executes it without knowing node kinds. Evidence: "
                "TestDescriptor.accept visits itself then calls child.accept(visitor); AbstractTestDescriptor holds the "
                "children set and findByUniqueId recurses; NodeTestTask creates one child task per child. Transparent "
                "variant: leaf vs container is decided by getType().",
         parts=[p("Component", oj + "platform.engine.TestDescriptor", PE + "TestDescriptor.java"),
                p("Composite (base)", oj + "platform.engine.support.descriptor.AbstractTestDescriptor", PE + "support/descriptor/AbstractTestDescriptor.java"),
                p("Composite", oj + "platform.engine.support.descriptor.EngineDescriptor", PE + "support/descriptor/EngineDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.JupiterEngineDescriptor", D + "JupiterEngineDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.ClassTestDescriptor", D + "ClassTestDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.NestedClassTestDescriptor", D + "NestedClassTestDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.ClassTemplateTestDescriptor", D + "ClassTemplateTestDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.ClassTemplateInvocationTestDescriptor", D + "ClassTemplateInvocationTestDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.TestTemplateTestDescriptor", D + "TestTemplateTestDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.TestFactoryTestDescriptor", D + "TestFactoryTestDescriptor.java"),
                p("Composite", oj + "jupiter.engine.descriptor.DynamicContainerTestDescriptor", D + "DynamicContainerTestDescriptor.java"),
                p("Leaf", oj + "jupiter.engine.descriptor.TestMethodTestDescriptor", D + "TestMethodTestDescriptor.java"),
                p("Leaf", oj + "jupiter.engine.descriptor.TestTemplateInvocationTestDescriptor", D + "TestTemplateInvocationTestDescriptor.java"),
                p("Leaf", oj + "jupiter.engine.descriptor.DynamicTestTestDescriptor", D + "DynamicTestTestDescriptor.java"),
                p("Client", oj + "platform.launcher.core.EngineDiscoveryOrchestrator#applyPostDiscoveryFilters", PL + "core/EngineDiscoveryOrchestrator.java"),
                p("Client", oj + "platform.engine.support.hierarchical.NodeTestTask#executeRecursively", H + "NodeTestTask.java")]),
    dict(id="A2", name="Composed Discovery Filter", pattern="Composite", type="Structural", concrete=3,
         intent="All post-discovery filters are merged into one Filter by Filter.composeFilters; CompositeFilter "
                "implements Filter, holds a list of Filters and combines their FilterResults into one answer (first "
                "exclusion wins). Overlaps A3 (same leaf classes seen as strategies).",
         parts=[p("Component", oj + "platform.engine.Filter", PE + "Filter.java"),
                p("Composite", oj + "platform.engine.CompositeFilter", PE + "CompositeFilter.java"),
                p("Leaf", oj + "platform.launcher.IncludeMethodFilter", PL + "IncludeMethodFilter.java"),
                p("Leaf", oj + "platform.launcher.ExcludeMethodFilter", PL + "ExcludeMethodFilter.java"),
                p("Leaf (lambda factory)", oj + "platform.launcher.TagFilter", PL + "TagFilter.java"),
                p("Client", oj + "platform.launcher.core.EngineDiscoveryOrchestrator#applyPostDiscoveryFilters", PL + "core/EngineDiscoveryOrchestrator.java")]),
    dict(id="A3", name="Post-Discovery Filter Policies", pattern="Strategy", type="Behavioral", concrete=3,
         intent="Selection rules (tag expressions, method-name patterns, custom filters) are interchangeable algorithms "
                "behind PostDiscoveryFilter; EngineDiscoveryOrchestrator only calls apply(). Overlaps A2.",
         parts=[p("Strategy", oj + "platform.launcher.PostDiscoveryFilter", PL + "PostDiscoveryFilter.java"),
                p("ConcreteStrategy", oj + "platform.launcher.IncludeMethodFilter", PL + "IncludeMethodFilter.java"),
                p("ConcreteStrategy", oj + "platform.launcher.ExcludeMethodFilter", PL + "ExcludeMethodFilter.java"),
                p("ConcreteStrategy (lambdas)", oj + "platform.launcher.TagFilter", PL + "TagFilter.java"),
                p("Context", oj + "platform.launcher.core.EngineDiscoveryOrchestrator#applyPostDiscoveryFilters", PL + "core/EngineDiscoveryOrchestrator.java")]),
    dict(id="A4", name="Jupiter Descriptor Skeletons", pattern="Template Method", type="Behavioral", concrete=3,
         intent="JupiterTestDescriptor fixes algorithms in final methods (getExecutionMode, getLegacyReportingName) and "
                "in copyIncludingDescendants, which calls the abstract primitive withUniqueId; subclasses override "
                "the hooks (getExplicitExecutionMode, getLegacyReportingBaseName, withUniqueId).",
         parts=[p("AbstractClass", oj + "jupiter.engine.descriptor.JupiterTestDescriptor", D + "JupiterTestDescriptor.java"),
                p("TemplateMethod", oj + "jupiter.engine.descriptor.JupiterTestDescriptor#getExecutionMode", D + "JupiterTestDescriptor.java"),
                p("TemplateMethod", oj + "jupiter.engine.descriptor.JupiterTestDescriptor#getLegacyReportingName", D + "JupiterTestDescriptor.java"),
                p("TemplateMethod", oj + "jupiter.engine.descriptor.JupiterTestDescriptor#copyIncludingDescendants", D + "JupiterTestDescriptor.java"),
                p("PrimitiveOperation", oj + "jupiter.engine.descriptor.JupiterTestDescriptor#withUniqueId", D + "JupiterTestDescriptor.java"),
                p("ConcreteClass (hook)", oj + "jupiter.engine.descriptor.ClassBasedTestDescriptor#getExplicitExecutionMode", D + "ClassBasedTestDescriptor.java"),
                p("ConcreteClass (hook)", oj + "jupiter.engine.descriptor.MethodBasedTestDescriptor#getExplicitExecutionMode", D + "MethodBasedTestDescriptor.java"),
                p("ConcreteClass (primitive)", oj + "jupiter.engine.descriptor.ClassTestDescriptor#withUniqueId", D + "ClassTestDescriptor.java")]),
    dict(id="A5", name="Child Ordering Skeleton", pattern="Template Method", type="Behavioral", concrete=2,
         intent="AbstractOrderingVisitor.orderChildrenTestDescriptors runs a fixed ordering algorithm (select, wrap, "
                "sort, unwrap, merge) and asks the abstract hook shouldNonMatchingDescriptorsComeBeforeOrderedOnes, "
                "which ClassOrderingVisitor and MethodOrderingVisitor answer differently.",
         parts=[p("AbstractClass", oj + "jupiter.engine.discovery.AbstractOrderingVisitor", JE + "discovery/AbstractOrderingVisitor.java"),
                p("TemplateMethod", oj + "jupiter.engine.discovery.AbstractOrderingVisitor#orderChildrenTestDescriptors", JE + "discovery/AbstractOrderingVisitor.java"),
                p("PrimitiveOperation", oj + "jupiter.engine.discovery.AbstractOrderingVisitor#shouldNonMatchingDescriptorsComeBeforeOrderedOnes", JE + "discovery/AbstractOrderingVisitor.java"),
                p("ConcreteClass", oj + "jupiter.engine.discovery.ClassOrderingVisitor", JE + "discovery/ClassOrderingVisitor.java"),
                p("ConcreteClass", oj + "jupiter.engine.discovery.MethodOrderingVisitor", JE + "discovery/MethodOrderingVisitor.java")]),
    dict(id="A6", name="Discovery Event Notification", pattern="Observer", type="Behavioral", concrete=2,
         intent="Discovery progress (launcher/engine discovery started and finished, selector processed, issues) is "
                "pushed to registered LauncherDiscoveryListeners that the orchestrator only knows by interface.",
         parts=[p("Observer", oj + "platform.launcher.LauncherDiscoveryListener", PL + "LauncherDiscoveryListener.java"),
                p("Observer (base)", oj + "platform.engine.EngineDiscoveryListener", PE + "EngineDiscoveryListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.core.DiscoveryIssueCollector", PL + "core/DiscoveryIssueCollector.java"),
                p("ConcreteObserver", oj + "platform.launcher.core.DiscoveryIssueReportingDiscoveryListener", PL + "core/DiscoveryIssueReportingDiscoveryListener.java"),
                p("Subject (attach)", oj + "platform.launcher.core.DefaultLauncher#registerLauncherDiscoveryListeners", PL + "core/DefaultLauncher.java"),
                p("Subject (notify)", oj + "platform.launcher.core.EngineDiscoveryOrchestrator#discoverEngineRoot", PL + "core/EngineDiscoveryOrchestrator.java"),
                p("Subject (notify, in engine)", oj + "platform.engine.support.discovery.EngineDiscoveryRequestResolution", PE + "support/discovery/EngineDiscoveryRequestResolution.java"),
                p("Multicaster", oj + "platform.launcher.listeners.discovery.CompositeLauncherDiscoveryListener", PL + "listeners/discovery/CompositeLauncherDiscoveryListener.java")]),
    dict(id="A7", name="Orderer Descriptor Wrappers", pattern="Adapter", type="Structural", concrete=2,
         intent="User ClassOrderer/MethodOrderer code expects the public ClassDescriptor/MethodDescriptor API; the "
                "wrappers expose internal descriptors through it so internal classes never leak to user code.",
         parts=[p("Target", oj + "jupiter.api.ClassDescriptor", JA + "ClassDescriptor.java"),
                p("Target", oj + "jupiter.api.MethodDescriptor", JA + "MethodDescriptor.java"),
                p("Adapter (base)", oj + "jupiter.engine.discovery.AbstractAnnotatedDescriptorWrapper", JE + "discovery/AbstractAnnotatedDescriptorWrapper.java"),
                p("Adapter", oj + "jupiter.engine.discovery.DefaultClassDescriptor", JE + "discovery/DefaultClassDescriptor.java"),
                p("Adapter", oj + "jupiter.engine.discovery.DefaultMethodDescriptor", JE + "discovery/DefaultMethodDescriptor.java"),
                p("Adaptee", oj + "jupiter.engine.descriptor.ClassBasedTestDescriptor", D + "ClassBasedTestDescriptor.java"),
                p("Adaptee", oj + "jupiter.engine.descriptor.MethodBasedTestDescriptor", D + "MethodBasedTestDescriptor.java"),
                p("Client", oj + "jupiter.engine.discovery.ClassOrderingVisitor", JE + "discovery/ClassOrderingVisitor.java")]),
    # ---------------- Area B ----------------
    dict(id="B1", name="Hierarchical Engine Execution Skeleton", pattern="Template Method", type="Behavioral", concrete=1,
         intent="final HierarchicalTestEngine.execute fixes the run order (executor service, context, collector "
                "factory, HierarchicalTestExecutor); JupiterTestEngine only supplies the steps. Overlaps B2.",
         parts=[p("AbstractClass", oj + "platform.engine.support.hierarchical.HierarchicalTestEngine", H + "HierarchicalTestEngine.java"),
                p("TemplateMethod", oj + "platform.engine.support.hierarchical.HierarchicalTestEngine#execute", H + "HierarchicalTestEngine.java"),
                p("PrimitiveOperation", oj + "platform.engine.support.hierarchical.HierarchicalTestEngine#createExecutionContext", H + "HierarchicalTestEngine.java"),
                p("ConcreteClass", oj + "jupiter.engine.JupiterTestEngine", JE + "JupiterTestEngine.java")]),
    dict(id="B2", name="Engine Collaborator Factory Methods", pattern="Factory Method", type="Creational", concrete=2,
         intent="The template in B1 asks overridable create* methods which objects to use; JupiterTestEngine "
                "overrides them to choose a parallel/same-thread executor, its JupiterEngineExecutionContext and its "
                "throwable-collector factory. Overlaps B1.",
         parts=[p("Creator (factory method)", oj + "platform.engine.support.hierarchical.HierarchicalTestEngine#createExecutorService", H + "HierarchicalTestEngine.java"),
                p("ConcreteCreator", oj + "jupiter.engine.JupiterTestEngine#createExecutorService", JE + "JupiterTestEngine.java"),
                p("ConcreteCreator", oj + "jupiter.engine.JupiterTestEngine#createExecutionContext", JE + "JupiterTestEngine.java"),
                p("ConcreteCreator", oj + "jupiter.engine.JupiterTestEngine#createThrowableCollectorFactory", JE + "JupiterTestEngine.java"),
                p("ConcreteProduct", oj + "jupiter.engine.execution.JupiterEngineExecutionContext", JE + "execution/JupiterEngineExecutionContext.java")]),
    dict(id="B3", name="Test Executor Services", pattern="Strategy", type="Behavioral", concrete=3,
         intent="Sequential vs parallel scheduling is swappable behind HierarchicalTestExecutorService; NodeTestTask "
                "and HierarchicalTestExecutor only call submit/invokeAll.",
         parts=[p("Strategy", oj + "platform.engine.support.hierarchical.HierarchicalTestExecutorService", H + "HierarchicalTestExecutorService.java"),
                p("ConcreteStrategy", oj + "platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService", H + "SameThreadHierarchicalTestExecutorService.java"),
                p("ConcreteStrategy", oj + "platform.engine.support.hierarchical.ForkJoinPoolHierarchicalTestExecutorService", H + "ForkJoinPoolHierarchicalTestExecutorService.java"),
                p("ConcreteStrategy", oj + "platform.engine.support.hierarchical.WorkerThreadPoolHierarchicalTestExecutorService", H + "WorkerThreadPoolHierarchicalTestExecutorService.java"),
                p("Context", oj + "platform.engine.support.hierarchical.HierarchicalTestExecutor", H + "HierarchicalTestExecutor.java"),
                p("Context", oj + "platform.engine.support.hierarchical.NodeTestTask#executeRecursively", H + "NodeTestTask.java")]),
    dict(id="B4", name="Parallelism Configuration Strategy", pattern="Strategy", type="Behavioral", concrete=3,
         intent="How parallelism is computed (FIXED, DYNAMIC from CPU count, CUSTOM user class) is chosen by "
                "configuration; each enum constant implements createConfiguration.",
         parts=[p("Strategy", oj + "platform.engine.support.hierarchical.ParallelExecutionConfigurationStrategy", H + "ParallelExecutionConfigurationStrategy.java"),
                p("ConcreteStrategy (enum FIXED/DYNAMIC/CUSTOM)", oj + "platform.engine.support.hierarchical.DefaultParallelExecutionConfigurationStrategy", H + "DefaultParallelExecutionConfigurationStrategy.java"),
                p("Selection", oj + "platform.engine.support.hierarchical.DefaultParallelExecutionConfigurationStrategy#getStrategy", H + "DefaultParallelExecutionConfigurationStrategy.java"),
                p("Context", oj + "platform.engine.support.hierarchical.ParallelHierarchicalTestExecutorServiceFactory", H + "ParallelHierarchicalTestExecutorServiceFactory.java")]),
    dict(id="B5", name="Intercepting Launcher Wrappers", pattern="Decorator", type="Structural", concrete=2,
         intent="The session's launcher is DelegatingLauncher > InterceptingLauncher > DefaultLauncher; each wrapper "
                "implements Launcher and forwards, InterceptingLauncher adds LauncherInterceptor around every call.",
         parts=[p("Component", oj + "platform.launcher.Launcher", PL + "Launcher.java"),
                p("ConcreteComponent", oj + "platform.launcher.core.DefaultLauncher", PL + "core/DefaultLauncher.java"),
                p("Decorator", oj + "platform.launcher.core.DelegatingLauncher", PL + "core/DelegatingLauncher.java"),
                p("ConcreteDecorator", oj + "platform.launcher.core.InterceptingLauncher", PL + "core/InterceptingLauncher.java"),
                p("Assembler", oj + "platform.launcher.core.DefaultLauncherSession", PL + "core/DefaultLauncherSession.java")]),
    dict(id="B6", name="Engine Listener Wrappers", pattern="Decorator", type="Structural", concrete=3,
         intent="EngineExecutionOrchestrator stacks independent wrappers (stack-trace pruning, outcome delaying, "
                "memory cleanup) on the engine listener; each forwards and adds one behaviour. Also part of Area C.",
         parts=[p("Component", oj + "platform.engine.EngineExecutionListener", PE + "EngineExecutionListener.java"),
                p("Decorator", oj + "platform.launcher.core.DelegatingEngineExecutionListener", PL + "core/DelegatingEngineExecutionListener.java"),
                p("ConcreteDecorator", oj + "platform.launcher.core.StackTracePruningEngineExecutionListener", PL + "core/StackTracePruningEngineExecutionListener.java"),
                p("ConcreteDecorator", oj + "platform.launcher.core.OutcomeDelayingEngineExecutionListener", PL + "core/OutcomeDelayingEngineExecutionListener.java"),
                p("ConcreteDecorator", oj + "platform.launcher.core.MemoryCleanupListener", PL + "core/MemoryCleanupListener.java"),
                p("Assembler", oj + "platform.launcher.core.EngineExecutionOrchestrator#executeEngine", PL + "core/EngineExecutionOrchestrator.java")]),
    dict(id="B7", name="Engine-to-Launcher Listener Adapter", pattern="Adapter", type="Structural", concrete=1,
         intent="Engines report with mutable TestDescriptors; ExecutionListenerAdapter implements "
                "EngineExecutionListener and forwards to a TestExecutionListener with immutable TestIdentifiers looked "
                "up in the TestPlan. Also part of Area C.",
         parts=[p("Target", oj + "platform.engine.EngineExecutionListener", PE + "EngineExecutionListener.java"),
                p("Adapter", oj + "platform.launcher.core.ExecutionListenerAdapter", PL + "core/ExecutionListenerAdapter.java"),
                p("Adaptee", oj + "platform.launcher.TestExecutionListener", PL + "TestExecutionListener.java"),
                p("Client (wiring)", oj + "platform.launcher.core.EngineExecutionOrchestrator#buildEngineExecutionListener", PL + "core/EngineExecutionOrchestrator.java")]),
    dict(id="B8", name="Execution Event Notification", pattern="Observer", type="Behavioral", concrete=2,
         intent="During execution NodeTestTask pushes executionStarted/Skipped/Finished to the EngineExecutionListener "
                "from the ExecutionRequest, without knowing who listens. Also part of Area C.",
         parts=[p("Observer", oj + "platform.engine.EngineExecutionListener", PE + "EngineExecutionListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.core.OutcomeDelayingEngineExecutionListener", PL + "core/OutcomeDelayingEngineExecutionListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.core.ExecutionListenerAdapter", PL + "core/ExecutionListenerAdapter.java"),
                p("Subject (notify)", oj + "platform.engine.support.hierarchical.NodeTestTask#executeRecursively", H + "NodeTestTask.java"),
                p("Subject (notify)", oj + "platform.engine.support.hierarchical.NodeTestTask#reportCompletion", H + "NodeTestTask.java")]),
    dict(id="B9", name="Node Execution Tasks", pattern="Command", type="Behavioral", concrete=1,
         intent="Each node's work is packaged as a TestTask object (execute + execution mode + lock) and handed to an "
                "executor service that decides when and on which thread to run it.",
         parts=[p("Command", oj + "platform.engine.support.hierarchical.HierarchicalTestExecutorService.TestTask", H + "HierarchicalTestExecutorService.java", "TestTask"),
                p("ConcreteCommand", oj + "platform.engine.support.hierarchical.NodeTestTask", H + "NodeTestTask.java"),
                p("Invoker", oj + "platform.engine.support.hierarchical.SameThreadHierarchicalTestExecutorService", H + "SameThreadHierarchicalTestExecutorService.java"),
                p("Invoker", oj + "platform.engine.support.hierarchical.ForkJoinPoolHierarchicalTestExecutorService", H + "ForkJoinPoolHierarchicalTestExecutorService.java")]),
    dict(id="B10", name="No-op Node", pattern="Null Object", type="Behavioral", concrete=1,
         intent="A TestDescriptor that is not a Node gets a do-nothing Node from NodeUtils.asNode, so NodeTestTask "
                "never needs null checks.",
         parts=[p("AbstractObject", oj + "platform.engine.support.hierarchical.Node", H + "Node.java"),
                p("NullObject provider", oj + "platform.engine.support.hierarchical.NodeUtils#asNode", H + "NodeUtils.java"),
                p("Client", oj + "platform.engine.support.hierarchical.NodeTestTask", H + "NodeTestTask.java")]),
    # ---------------- Area C ----------------
    dict(id="C1", name="Test Execution Listeners", pattern="Observer", type="Behavioral", concrete=5,
         intent="Client-side observers (IDE, summary, logging, unique-id file, JFR, stdout capture) register three ways "
                "and are notified of the same run events; notifyEach isolates each listener's failure. Different from "
                "B8 (engine side).",
         parts=[p("Observer", oj + "platform.launcher.TestExecutionListener", PL + "TestExecutionListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.listeners.SummaryGeneratingListener", PL + "listeners/SummaryGeneratingListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.listeners.LoggingListener", PL + "listeners/LoggingListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.listeners.UniqueIdTrackingListener", PL + "listeners/UniqueIdTrackingListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.jfr.FlightRecordingExecutionListener", PL + "jfr/FlightRecordingExecutionListener.java"),
                p("ConcreteObserver", oj + "platform.launcher.core.StreamInterceptingTestExecutionListener", PL + "core/StreamInterceptingTestExecutionListener.java"),
                p("Subject (attach)", oj + "platform.launcher.core.DefaultLauncher#registerTestExecutionListeners", PL + "core/DefaultLauncher.java"),
                p("Subject (notify)", oj + "platform.launcher.core.CompositeTestExecutionListener#notifyEach", PL + "core/CompositeTestExecutionListener.java")]),
    dict(id="C2", name="Launcher Session Notification", pattern="Observer", type="Behavioral", concrete=1,
         intent="LauncherSessionListeners are told when a launcher session opens and closes by DefaultLauncherSession.",
         parts=[p("Observer", oj + "platform.launcher.LauncherSessionListener", PL + "LauncherSessionListener.java"),
                p("Subject", oj + "platform.launcher.core.DefaultLauncherSession", PL + "core/DefaultLauncherSession.java"),
                p("Multicaster", oj + "platform.launcher.listeners.session.CompositeLauncherSessionListener", PL + "listeners/session/CompositeLauncherSessionListener.java")]),
    dict(id="C3", name="Listener Notification Order", pattern="Strategy", type="Behavioral", concrete=2,
         intent="The order in which listeners are notified is an interchangeable algorithm: IterationOrder.ORIGINAL "
                "for started events, REVERSED for finished events, used by notifyEach.",
         parts=[p("Strategy + ConcreteStrategies (ORIGINAL, REVERSED)", oj + "platform.launcher.core.IterationOrder", PL + "core/IterationOrder.java"),
                p("Context", oj + "platform.launcher.core.CompositeTestExecutionListener#notifyEach", PL + "core/CompositeTestExecutionListener.java"),
                p("Context", oj + "platform.launcher.core.CompositeEngineExecutionListener#notifyEach", PL + "core/CompositeEngineExecutionListener.java")]),
    dict(id="C4", name="Pluggable Log Sink", pattern="Strategy", type="Behavioral", concrete=2,
         intent="LoggingListener's behaviour is fixed but where log lines go is an injected BiConsumer "
                "(java.util.logging via forJavaUtilLogging, or any sink via forBiConsumer).",
         parts=[p("Strategy", "java.util.function.BiConsumer", None),
                p("ConcreteStrategy factory", oj + "platform.launcher.listeners.LoggingListener#forJavaUtilLogging", PL + "listeners/LoggingListener.java"),
                p("ConcreteStrategy factory", oj + "platform.launcher.listeners.LoggingListener#forBiConsumer", PL + "listeners/LoggingListener.java"),
                p("Context", oj + "platform.launcher.listeners.LoggingListener", PL + "listeners/LoggingListener.java")]),
    dict(id="C5", name="Test Reporter Adapter", pattern="Adapter", type="Structural", concrete=1,
         intent="Tests call the simple TestReporter API; DefaultTestReporter implements it by calling "
                "ExtensionContext.publishReportEntry, which turns the map into a ReportEntry event.",
         parts=[p("Target", oj + "jupiter.api.TestReporter", JA + "TestReporter.java"),
                p("Adapter", oj + "jupiter.engine.extension.DefaultTestReporter", JE + "extension/DefaultTestReporter.java"),
                p("Adaptee", oj + "jupiter.engine.descriptor.AbstractExtensionContext#publishReportEntry", D + "AbstractExtensionContext.java")]),
    dict(id="C6", name="Captured Output Stream", pattern="Decorator", type="Structural", concrete=1,
         intent="StreamInterceptor extends PrintStream, wraps System.out/err, copies every write into a per-thread "
                "buffer and still forwards to the original stream (super.write).",
         parts=[p("Component", "java.io.PrintStream", None),
                p("ConcreteDecorator", oj + "platform.launcher.core.StreamInterceptor", PL + "core/StreamInterceptor.java"),
                p("Installer / client", oj + "platform.launcher.core.StreamInterceptingTestExecutionListener", PL + "core/StreamInterceptingTestExecutionListener.java")]),
    dict(id="C7", name="No-op Listeners", pattern="Null Object", type="Behavioral", concrete=2,
         intent="EngineExecutionListener.NOOP and LauncherSessionListener.NOOP stand in for 'no listener' so callers "
                "never check for null; LauncherSessionListeners returns NOOP for an empty list.",
         parts=[p("NullObject holder", oj + "platform.engine.EngineExecutionListener", PE + "EngineExecutionListener.java"),
                p("NullObject holder", oj + "platform.launcher.LauncherSessionListener", PL + "LauncherSessionListener.java"),
                p("Client", oj + "platform.launcher.listeners.session.LauncherSessionListeners", PL + "listeners/session/LauncherSessionListeners.java")]),
    # ---------------- Area D ----------------
    dict(id="D1", name="Temp Directory Creation", pattern="Strategy", type="Behavioral", concrete=1,
         intent="How a @TempDir directory is created is a TempDirFactory chosen from @TempDir(factory) or the "
                "configuration; TempDirFactory.Standard is the default.",
         parts=[p("Strategy", oj + "jupiter.api.io.TempDirFactory", JA + "io/TempDirFactory.java"),
                p("ConcreteStrategy", oj + "jupiter.api.io.TempDirFactory.Standard", JA + "io/TempDirFactory.java", "Standard"),
                p("Selection", oj + "jupiter.engine.extension.TempDirectory#determineTempDirFactory", JE + "extension/TempDirectory.java"),
                p("Context", oj + "jupiter.engine.extension.TempDirectory", JE + "extension/TempDirectory.java")]),
    dict(id="D2", name="Temp Directory Deletion", pattern="Strategy", type="Behavioral", concrete=2,
         intent="How a temp directory is deleted is a TempDirDeletionStrategy (IgnoreFailures or Standard) chosen from "
                "@TempDir(deletionStrategy) or the configuration and called from Cleanup.run.",
         parts=[p("Strategy", oj + "jupiter.api.io.TempDirDeletionStrategy", JA + "io/TempDirDeletionStrategy.java"),
                p("ConcreteStrategy", oj + "jupiter.api.io.TempDirDeletionStrategy.IgnoreFailures", JA + "io/TempDirDeletionStrategy.java", "IgnoreFailures"),
                p("ConcreteStrategy", oj + "jupiter.api.io.TempDirDeletionStrategy.Standard", JA + "io/TempDirDeletionStrategy.java", "Standard"),
                p("Selection", oj + "jupiter.engine.extension.TempDirectory#determineDeletionStrategy", JE + "extension/TempDirectory.java")]),
    dict(id="D3", name="Parameter Resolution", pattern="Strategy", type="Behavioral", concrete=3,
         intent="For each parameter the context asks every ParameterResolver supportsParameter; exactly one must match "
                "and its resolveParameter supplies the value (none or several is an error).",
         parts=[p("Strategy", oj + "jupiter.api.extension.ParameterResolver", JA + "extension/ParameterResolver.java"),
                p("ConcreteStrategy", oj + "jupiter.engine.extension.TempDirectory", JE + "extension/TempDirectory.java"),
                p("ConcreteStrategy", oj + "jupiter.engine.extension.TestInfoParameterResolver", JE + "extension/TestInfoParameterResolver.java"),
                p("ConcreteStrategy", oj + "jupiter.engine.extension.TestReporterParameterResolver", JE + "extension/TestReporterParameterResolver.java"),
                p("Context", oj + "jupiter.engine.execution.ParameterResolutionUtils#resolveParameter", JE + "execution/ParameterResolutionUtils.java")]),
    dict(id="D4", name="Conditional Execution", pattern="Strategy", type="Behavioral", concrete=1,
         intent="Each ExecutionCondition encapsulates an enable/disable policy; ConditionEvaluator applies all of them "
                "and the first 'disabled' wins.",
         parts=[p("Strategy", oj + "jupiter.api.extension.ExecutionCondition", JA + "extension/ExecutionCondition.java"),
                p("ConcreteStrategy", oj + "jupiter.engine.extension.DisabledCondition", JE + "extension/DisabledCondition.java"),
                p("Context", oj + "jupiter.engine.execution.ConditionEvaluator#evaluate", JE + "execution/ConditionEvaluator.java"),
                p("Caller", oj + "jupiter.engine.descriptor.JupiterTestDescriptor#shouldBeSkipped", D + "JupiterTestDescriptor.java")]),
    dict(id="D5", name="Store Close Action", pattern="Strategy", type="Behavioral", concrete=1,
         intent="The platform store does not know how to close Jupiter values, so AbstractExtensionContext injects a "
                "CloseAction (close AutoCloseable / CloseableResource values).",
         parts=[p("Strategy", oj + "platform.engine.support.store.NamespacedHierarchicalStore.CloseAction", PE + "support/store/NamespacedHierarchicalStore.java", "CloseAction"),
                p("ConcreteStrategy (lambda)", oj + "jupiter.engine.descriptor.AbstractExtensionContext#createCloseAction", D + "AbstractExtensionContext.java"),
                p("Context", oj + "platform.engine.support.store.NamespacedHierarchicalStore#close", PE + "support/store/NamespacedHierarchicalStore.java")]),
    dict(id="D6", name="Extension Store Adapter", pattern="Adapter", type="Structural", concrete=1,
         intent="Extensions use the namespace-scoped ExtensionContext.Store; NamespaceAwareStore implements it on top "
                "of the platform NamespacedHierarchicalStore, fixing the namespace and translating exceptions.",
         parts=[p("Target", oj + "jupiter.api.extension.ExtensionContext.Store", JA + "extension/ExtensionContext.java", "Store"),
                p("Adapter", oj + "jupiter.engine.execution.NamespaceAwareStore", JE + "execution/NamespaceAwareStore.java"),
                p("Adaptee", oj + "platform.engine.support.store.NamespacedHierarchicalStore", PE + "support/store/NamespacedHierarchicalStore.java"),
                p("Adapter factory", oj + "jupiter.engine.execution.LauncherStoreFacade#getStoreAdapter", JE + "execution/LauncherStoreFacade.java"),
                p("Client", oj + "jupiter.engine.descriptor.AbstractExtensionContext#getStore", D + "AbstractExtensionContext.java")]),
    dict(id="D7", name="Lifecycle Method Adapters", pattern="Adapter", type="Structural", concrete=0,
         intent="A user's @BeforeEach/@AfterEach Method is wrapped as a synthetic extension implementing "
                "BeforeEachMethodAdapter/AfterEachMethodAdapter so it runs through the extension ordering. Adapters "
                "are lambdas (no named class).",
         parts=[p("Target", oj + "jupiter.engine.execution.BeforeEachMethodAdapter", JE + "execution/BeforeEachMethodAdapter.java"),
                p("Target", oj + "jupiter.engine.execution.AfterEachMethodAdapter", JE + "execution/AfterEachMethodAdapter.java"),
                p("Adapter (lambda)", oj + "jupiter.engine.descriptor.ClassBasedTestDescriptor#synthesizeBeforeEachMethodAdapter", D + "ClassBasedTestDescriptor.java"),
                p("Adapter (lambda)", oj + "jupiter.engine.descriptor.ClassBasedTestDescriptor#synthesizeAfterEachMethodAdapter", D + "ClassBasedTestDescriptor.java"),
                p("Client", oj + "jupiter.engine.descriptor.TestMethodTestDescriptor#invokeBeforeEachMethods", D + "TestMethodTestDescriptor.java")]),
    dict(id="D8", name="Test Outcome Watchers", pattern="Observer", type="Behavioral", concrete=1,
         intent="TestWatcher extensions are told each test's outcome and cannot change it; their exceptions are only "
                "logged.",
         parts=[p("Observer", oj + "jupiter.api.extension.TestWatcher", JA + "extension/TestWatcher.java"),
                p("ConcreteObserver", oj + "jupiter.engine.extension.RepetitionExtension", JE + "extension/RepetitionExtension.java"),
                p("Subject (notify)", oj + "jupiter.engine.descriptor.MethodBasedTestDescriptor#invokeTestWatchers", D + "MethodBasedTestDescriptor.java"),
                p("Subject (trigger)", oj + "jupiter.engine.descriptor.TestMethodTestDescriptor#nodeFinished", D + "TestMethodTestDescriptor.java")]),
    dict(id="D9", name="Invocation Interceptor Chain", pattern="Chain of Responsibility", type="Behavioral", concrete=1,
         intent="Every test/lifecycle/constructor call passes through a chain of InvocationInterceptors built back to "
                "front; each handler can proceed(), skip() or wrap the rest of the chain (interceptor-chain variant).",
         parts=[p("Handler", oj + "jupiter.api.extension.InvocationInterceptor", JA + "extension/InvocationInterceptor.java"),
                p("ConcreteHandler", oj + "jupiter.engine.extension.TimeoutExtension", JE + "extension/TimeoutExtension.java"),
                p("Chain builder", oj + "jupiter.engine.execution.InvocationInterceptorChain#chainInterceptors", JE + "execution/InvocationInterceptorChain.java"),
                p("Link to next handler", oj + "jupiter.engine.execution.InvocationInterceptorChain.InterceptedInvocation", JE + "execution/InvocationInterceptorChain.java", "InterceptedInvocation"),
                p("Client", oj + "jupiter.engine.execution.InterceptingExecutableInvoker", JE + "execution/InterceptingExecutableInvoker.java")]),
    dict(id="D10", name="Timeout Invocation Wrappers", pattern="Decorator", type="Structural", concrete=3,
         intent="TimeoutExtension.decorate wraps the Invocation in a timeout-aware Invocation that keeps the original "
                "as delegate and adds timing around delegate.proceed(); ValidatingInvocation adds a call-once check.",
         parts=[p("Component", oj + "jupiter.api.extension.InvocationInterceptor.Invocation", JA + "extension/InvocationInterceptor.java", "Invocation"),
                p("ConcreteDecorator", oj + "jupiter.engine.extension.SameThreadTimeoutInvocation", JE + "extension/SameThreadTimeoutInvocation.java"),
                p("ConcreteDecorator", oj + "jupiter.engine.extension.SeparateThreadTimeoutInvocation", JE + "extension/SeparateThreadTimeoutInvocation.java"),
                p("ConcreteDecorator", oj + "jupiter.engine.execution.InvocationInterceptorChain.ValidatingInvocation", JE + "execution/InvocationInterceptorChain.java", "ValidatingInvocation"),
                p("Client", oj + "jupiter.engine.extension.TimeoutExtension#decorate", JE + "extension/TimeoutExtension.java")]),
    dict(id="D11", name="Packaged Reflective Calls", pattern="Command", type="Behavioral", concrete=2,
         intent="A resolved reflective call (method or constructor + target + arguments) is packaged as an Invocation "
                "object so interceptors can run it later, on another thread, or skip it.",
         parts=[p("Command", oj + "jupiter.api.extension.InvocationInterceptor.Invocation", JA + "extension/InvocationInterceptor.java", "Invocation"),
                p("ConcreteCommand", oj + "jupiter.engine.execution.MethodInvocation", JE + "execution/MethodInvocation.java"),
                p("ConcreteCommand", oj + "jupiter.engine.execution.ConstructorInvocation", JE + "execution/ConstructorInvocation.java"),
                p("Client", oj + "jupiter.engine.execution.InterceptingExecutableInvoker", JE + "execution/InterceptingExecutableInvoker.java")]),
]
