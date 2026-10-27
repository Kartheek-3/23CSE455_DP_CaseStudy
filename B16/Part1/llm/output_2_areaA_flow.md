<!-- Raw output of Part 1, prompt 2 (Part1/llm/prompt_2_areaA_flow.txt), same Claude chat as prompt 1. Copied verbatim. -->

~~I wrote a simpler walkthrough of area A in a separate file.~~ [Edit: you asked for the answer in chat, so the file is gone. The full explanation is in the next message.]

Here's area A in plain words, using the files from the map. Example: `class CalcTest { @Test @Tag("fast") void adds(){}  @Test @Tag("slow") void divides(){} }`, and the IDE asks to run only the `fast` tests.

**1. Write the request.** The IDE uses `DiscoverySelectors.selectClass(CalcTest.class)` to make a `ClassSelector`, which says what to look at. It adds a `TagFilter` for "fast", which says what to drop. `LauncherDiscoveryRequestBuilder` packs both into a `LauncherDiscoveryRequest`. Think of selectors as the shopping list and filters as the "no nuts" rule.

**2. The launcher asks each engine.** `EngineDiscoveryOrchestrator` gives the request to every installed engine. It gives each engine a root `UniqueId` such as `[engine:junit-jupiter]`, and `EngineFilterer` skips any engine you excluded.

**3. Jupiter starts its tree.** `JupiterTestEngine.discover` creates the root node, `JupiterEngineDescriptor`. `DiscoverySelectorResolver` then plugs Jupiter's two "experts", `ClassSelectorResolver` and `MethodSelectorResolver`, into the platform's general search machine, `EngineDiscoveryRequestResolver`.

**4. The to-do loop.** This is the heart of discovery. `EngineDiscoveryRequestResolution` takes one selector at a time and asks each expert whether it can handle it:
- `ClassSelector(CalcTest)` goes to `ClassSelectorResolver`. `TestClassPredicates` confirms it is a test class, and a `ClassTestDescriptor` is created. Its methods are added to the to-do list as `MethodSelector`s.
- `MethodSelector(adds)` and `MethodSelector(divides)` go to `MethodSelectorResolver`. `IsTestMethod` sees `@Test`, and a `TestMethodTestDescriptor` is created for each one.
- Other annotations become other node types: `@TestFactory` gives a `TestFactoryTestDescriptor`, `@TestTemplate` gives a `TestTemplateTestDescriptor`, and `@Nested` gives a `NestedClassTestDescriptor`.

**5. Tidy up.** `ClassOrderingVisitor` and `MethodOrderingVisitor` sort the nodes. Validation reports mistakes, such as a private `@Test` method, through `DiscoveryIssueReporter`. Jupiter's tree is now:
```
JupiterEngineDescriptor
└── ClassTestDescriptor (CalcTest)
    ├── TestMethodTestDescriptor (adds, fast)
    └── TestMethodTestDescriptor (divides, slow)
```

**6. Check, filter, prune.** Back in the launcher, `EngineDiscoveryResultValidator` checks that the tree has no loops. `TagFilter` removes `divides()`. Then `prune()` drops any container left with no tests. `CalcTest` stays because `adds()` survived.

**7. Hand over a copy.** `TestPlan.from(...)` turns every node into a frozen `TestIdentifier`, and the IDE shows that `TestPlan`. The real tree stays inside `InternalTestPlan` until it is run in area B.

In short, the platform supplies the search loop and Jupiter supplies the experts that understand `@Test`. The result is a tree of `TestDescriptor`s, and the IDE only ever sees a read-only copy of it.
