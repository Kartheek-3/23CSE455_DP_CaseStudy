<!-- Raw output of Part 1, prompt 8 (Part1/llm/prompt_8_areaD_flow.txt), same Claude chat. Copied verbatim. -->

Got it: a simple walkthrough of area D in chat. I'll read the extension and TempDir code first.

Here's area D step by step, using this example:

```java
class TimingExtension implements BeforeEachCallback, AfterEachCallback {
    static final Namespace NS = Namespace.create(TimingExtension.class);
    public void beforeEach(ExtensionContext ctx) { ctx.getStore(NS).put("start", System.nanoTime()); }
    public void afterEach(ExtensionContext ctx) {
        long start = ctx.getStore(NS).remove("start", long.class);
        System.out.println(ctx.getDisplayName() + " took " + (System.nanoTime() - start) + " ns");
    }
}

@ExtendWith(TimingExtension.class)
class FileTest {
    @Test
    void writesFile(@TempDir Path dir) throws IOException {
        Path f = dir.resolve("a.txt");
        Files.writeString(f, "hi");
        assertEquals("hi", Files.readString(f));
    }
}
```

All paths below are under `junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/` unless another module is named.

**1. The engine creates a root registry with the built-in extensions.**
When the engine starts, `MutableExtensionRegistry.createRegistryWithDefaultExtensions` (`extension/MutableExtensionRegistry.java:81-97`) registers `DisabledCondition`, `AutoCloseExtension`, `TimeoutExtension`, `RepeatedTestExtension`, the `TestInfo` and `TestReporter` resolvers, and `TempDirectory` (line 86). That's why `@TempDir` works without any `@ExtendWith`. If auto-detection is switched on, it also loads extensions through ServiceLoader.

**2. The class gets its own registry, and that's where `TimingExtension` is registered.**
`ClassBasedTestDescriptor.prepare` (`descriptor/ClassBasedTestDescriptor.java:186-226`) makes a child registry that copies the parent's entries, then adds:
- extensions from `@ExtendWith` on the class (lines 187-188), and
- extensions declared on static fields, constructor parameters, lifecycle-method parameters and instance fields (lines 192-214).

`registerExtension` creates `TimingExtension` with its no-arg constructor, but only if that type isn't already registered (`MutableExtensionRegistry.java:188-192`). The class also gets a `ClassExtensionContext`, which has its own store whose parent is the engine's store.

**3. Class-level callbacks run once.**
`before()` runs the `BeforeAllCallback`s in registration order (`ClassBasedTestDescriptor.java:247`). `TempDirectory.beforeAll` fills any static `@TempDir` fields; there are none here. The matching `AfterAllCallback`s run at the very end (step 8).

**4. The method prepares its own registry, context and test instance.**
`TestMethodTestDescriptor.prepare` (`descriptor/TestMethodTestDescriptor.java:113-131`) makes another child registry (adding any `@ExtendWith` on the method or its parameters) and a `MethodExtensionContext`. It then creates the `FileTest` instance.

**5. Callbacks wrap the test like layers of an onion** (`TestMethodTestDescriptor.java:146-166`):
1. `BeforeEachCallback`s: `TempDirectory.beforeEach` (fills instance `@TempDir` fields, none here), then `TimingExtension.beforeEach` stores the start time.
2. `@BeforeEach` methods.
3. `BeforeTestExecutionCallback`s.
4. **The test method itself** (step 6).
5. `AfterTestExecutionCallback`s, then `@AfterEach` methods.
6. `AfterEachCallback`s: `TimingExtension.afterEach` prints the time.

"Before" callbacks run in registration order and "after" callbacks in reverse (`descriptor/CallbackSupport.java:33` vs `:48`). Errors go into a `ThrowableCollector`, so the "after" layers still run even when the test fails.

**6. `@TempDir Path dir` is resolved just before the method is called.**
`invokeTestMethod` (`TestMethodTestDescriptor.java:211-220`) asks the executable invoker to call `writesFile`. First it resolves each parameter in `ParameterResolutionUtils.resolveParameter` (`execution/ParameterResolutionUtils.java:127-155`):
- It asks every registered `ParameterResolver` whether it `supportsParameter`. Exactly one must say yes; none gives "No ParameterResolver registered", more than one gives "multiple competing ParameterResolvers".
- `TempDirectory.supportsParameter` just checks `parameterContext.isAnnotated(TempDir.class)` (`extension/TempDirectory.java:156-158`).
- `TempDirectory.resolveParameter` (lines 165-170) checks the type is `Path` or `File`, chooses the factory and cleanup mode, and then (lines 225-229) does:
  ```java
  extensionContext.getStore(NAMESPACE.append(elementContext))
      .computeIfAbsent(KEY, __ -> createTempDir(...), CloseablePath.class)
  ```
  So the directory is created once, wrapped in a `CloseablePath`, and **stored in the method's store**. That stored object is what gets it deleted later.

Invocation interceptors such as `TimeoutExtension` then wrap the actual call.

**7. Resources are cleaned up when the method's context closes.**
`NodeTestTask` calls `cleanUp()` and then `reportCompletion()` (`junit-platform-engine/.../hierarchical/NodeTestTask.java:118-121`). So:
- `TestMethodTestDescriptor.cleanUp` (lines 170-176) runs `TestInstancePreDestroyCallback`s first. That's where `AutoCloseExtension` closes `@AutoClose` fields in the default per-method lifecycle.
- It then calls `context.close()`, which closes the extension context, which closes its store (`descriptor/JupiterTestDescriptor.java:249-251`, `descriptor/AbstractExtensionContext.java:126-127`).
- The store closes its values **in reverse insertion order** (`junit-platform-engine/.../store/NamespacedHierarchicalStore.java:135-152`). Each `AutoCloseable` value gets `close()` called (`AbstractExtensionContext.java:104-123`; this is on by default).
- `CloseablePath.close()` runs `Cleanup.run` (`TempDirectory.java:289-297, 340-356`). That deletes the directory unless the cleanup mode is `NEVER`, or `ON_SUCCESS` and the test failed. Then it closes the factory.

Only after that do `TestWatcher`s get `testSuccessful` or `testFailed` (`TestMethodTestDescriptor.java:278-291`), and the listener gets `executionFinished`. So the temp dir is already gone when watchers run.

**8. Class-level cleanup.**
The class runs `@AfterAll` methods, then the `AfterAllCallback`s in reverse order (`AutoCloseExtension.afterAll` closes static `@AutoClose` fields), then its own store closes in the same way. The engine's root context closes last.

In short: extensions are registered level by level into registries that copy their parent's. Callbacks wrap the test in registration order on the way in and reverse order on the way out. `@TempDir` is just a built-in `ParameterResolver` that keeps its directory in the method's store, so closing that store is what deletes it.
