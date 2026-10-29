<!-- Raw output of Part 1, prompt 4 (Part1/llm/prompt_4_areaB_flow.txt), same Claude chat. Copied verbatim. -->

Here's area B in plain words, using the files from the map. Example class:
```java
class CalcTest {
    @BeforeAll static void startAll() {}
    @BeforeEach void setUp() {}
    @Test void adds() {}
    @Test @Disabled void divides() {}
}
```
Discovery (area A) already built the tree `JupiterEngineDescriptor → ClassTestDescriptor(CalcTest) → TestMethodTestDescriptor(adds), TestMethodTestDescriptor(divides)`.

**1. The launcher starts the run.** `DefaultLauncher.execute(...)` opens a request-level store, which lives for this one run, and hands the test plan to `EngineExecutionOrchestrator`. The orchestrator tells listeners "test plan started". Then, for each engine, it calls `TestEngine.execute(ExecutionRequest)`. The `ExecutionRequest` carries the engine's tree root, a listener for reporting results, the configuration and the store.

**2. The engine sets up its machinery.** `JupiterTestEngine` doesn't write its own `execute`. It inherits the `final` one from `HierarchicalTestEngine`, which builds three things before anything runs:
- an executor: `SameThreadHierarchicalTestExecutorService`, or a parallel one if parallel execution is turned on;
- a starting context: a `JupiterEngineExecutionContext`, the bag of state passed down the tree;
- an error catcher: a `ThrowableCollector`, so exceptions are recorded instead of crashing the run.

Then `HierarchicalTestExecutor` runs `NodeTreeWalker` to work out any locks, wraps the root in a `NodeTestTask`, and submits it.

**3. Every node follows the same recipe.** `NodeTestTask.execute()` treats each node in the tree as a `Node` and calls, in order:
`prepare` → `shouldBeSkipped` → (report started) → `before` → `execute` → **run the children** → `after` → `cleanUp` → (report finished or skipped)

Walking down the tree is simply that recipe calling itself for each child: "run the children" creates a new `NodeTestTask` per child and hands them to the executor.

**4. Engine node.** `JupiterEngineDescriptor.prepare` creates the root extension registry with the built-ins (`@Disabled` handling, `@TempDir`, `@Timeout` and so on). It has no work of its own, so it moves straight on to its child, `CalcTest`.

**5. Class node (`ClassTestDescriptor`).**
- `prepare` registers the class's extensions and creates a class-level extension context.
- `shouldBeSkipped` asks every condition whether to skip. Nothing disables `CalcTest`, so it continues.
- The listener reports "CalcTest started".
- `before` runs `@BeforeAll` `startAll()`.
- Then the two method nodes run as its children.

**6. Method node `adds()` (`TestMethodTestDescriptor`).**
- `prepare` creates a new `CalcTest` instance (with the default per-method lifecycle) and a method-level context.
- `shouldBeSkipped` finds nothing that disables it.
- The listener reports "adds started".
- `execute` runs the inner order: before-each callbacks → `@BeforeEach` `setUp()` → before-test callbacks → **`adds()` itself** → after-test callbacks → `@AfterEach` → after-each callbacks. The test method is called through `InterceptingExecutableInvoker`.
- Any exception is caught by the throwable collector.
- `cleanUp` closes the method's context.
- The listener reports "adds finished: SUCCESSFUL". It would be FAILED if an assertion threw, or ABORTED if an assumption failed.

**7. Method node `divides()`.** `shouldBeSkipped` asks the built-in `DisabledCondition`, which sees `@Disabled` and says skip. `NodeTestTask` jumps straight to reporting "divides skipped". No instance is created and nothing in the method runs.

**8. Back up the tree.** With both children done, the class node runs `after` (`@AfterAll`, if there is one), then `cleanUp`, and reports "CalcTest finished". The engine node does the same. Back in the launcher, `OutcomeDelayingEngineExecutionListener` reports the engine as finished, the orchestrator reports "test plan finished", and the request-level store is closed.

Events the IDE sees, in order:
```
plan started → engine started → CalcTest started
  → adds started → adds finished (SUCCESSFUL)
  → divides skipped ("void CalcTest.divides() is @Disabled")
→ CalcTest finished → engine finished → plan finished
```

The key idea for area B: the platform (`HierarchicalTestEngine`, `NodeTestTask`) owns the order of steps and the error handling. Jupiter only fills in what each step does for an engine, a class or a method.
