<!-- Raw output of Part 1, prompt 6 (Part1/llm/prompt_6_areaC_flow.txt), same Claude chat. Copied verbatim. -->

Got it: a simple area C walkthrough, in chat. I'll first check the listener and summary classes in the source.

Here's area C in plain words, using the files from the map. Example:
```java
class CalcTest {
    @Test void adds(TestReporter reporter) {
        reporter.publishEntry("result", "4");
        assertEquals(4, 2 + 2);
    }
    @Test void broken() { assertEquals(5, 2 + 2); }
}
```
The IDE runs it and passes in its own `TestExecutionListener`. Assume a `SummaryGeneratingListener` is also registered.

**1. Before any test runs, the listener chain is built.** `EngineExecutionOrchestrator` collects the listeners registered on the launcher plus the one the IDE passed in, and wraps them all in one `CompositeTestExecutionListener`. It then builds the chain that the engine will talk to. From the engine's side it looks like this:
```
NodeTestTask (engine)
 → OutcomeDelayingEngineExecutionListener
 → StackTracePruningEngineExecutionListener
 → CompositeEngineExecutionListener
 → ExecutionListenerAdapter
 → CompositeTestExecutionListener
     ├─ IDE listener
     └─ SummaryGeneratingListener
```
Before any test, the orchestrator calls `testPlanExecutionStarted(testPlan)`. `SummaryGeneratingListener` uses it to create a fresh `MutableTestExecutionSummary`.

**2. The engine creates the events.** Only the engine decides results. `NodeTestTask` calls `executionStarted`, `executionSkipped` and `executionFinished` on the first link of the chain, passing the `TestDescriptor` and a `TestExecutionResult`.

**3. How the result is decided.** Every step of a test runs inside a `ThrowableCollector`, which catches any exception instead of letting it escape. When the test is done, the collector turns what it caught into a `TestExecutionResult`:
- `adds()` throws nothing, so its result is `SUCCESSFUL`.
- `broken()`'s `assertEquals` throws an `AssertionFailedError`, which gives `FAILED` with that exception attached.
- An assumption failure (`TestAbortedException`) would give `ABORTED`.

**4. Report entries go out mid-test.** `reporter.publishEntry(...)` goes through `DefaultTestReporter` to `ExtensionContext.publishReportEntry`, which builds a `ReportEntry` and calls `reportingEntryPublished` on the same chain. So the IDE gets "adds: result=4" while `adds()` is still running.

**5. Each link in the chain does one job.**
- `OutcomeDelayingEngineExecutionListener` passes test events straight through but holds back the engine's own "finished" event until `execute()` returns. That way a crash in the engine itself can be added to the engine's result.
- `StackTracePruningEngineExecutionListener` trims JUnit's internal frames from `broken()`'s stack trace, so the report starts near your test code.
- `CompositeEngineExecutionListener` copies each event to every engine-level listener.
- `ExecutionListenerAdapter` swaps the internal `TestDescriptor` for the client-facing `TestIdentifier` (looked up in the `TestPlan`) and calls the matching `TestExecutionListener` method.
- `CompositeTestExecutionListener` hands the event to each client listener in turn. "Started" events go in registration order and "finished" events in reverse. If one listener throws, the error is logged and the others still get the event.

**6. Each listener builds its own view.**
- The IDE listener ticks `adds` green and shows `broken` in red with the trimmed stack trace.
- `SummaryGeneratingListener` updates counters: `executionStarted` adds to "tests started", and `executionFinished` adds to "succeeded" or "failed". For a failure it also stores the test and its exception with `addFailure(...)`. The class and engine containers get counted too.

**7. The end of the run.** The engine container finishes, then `OutcomeDelayingEngineExecutionListener.reportEngineOutcome()` releases the engine's held "finished" event. After that, the orchestrator calls `testPlanExecutionFinished`, and the summary records the finish time.

The summary now reads tests found 2, started 2, succeeded 1, failed 1. Calling `summary.printTo(writer)` prints those counts, and `printFailuresTo(writer)` prints `broken()` with its stack trace.

Events the IDE sees, in order:
```
plan started → engine started → CalcTest started
  → adds started → report entry (result=4) → adds finished SUCCESSFUL
  → broken started → broken finished FAILED (AssertionFailedError)
→ CalcTest finished → engine finished → plan finished
```

The key idea for area C: the engine only speaks `EngineExecutionListener` in terms of `TestDescriptor`. The launcher adapts that to `TestExecutionListener` in terms of `TestIdentifier` and copies each event to every listener. Reports and summaries are built separately by each listener as the events go by.
