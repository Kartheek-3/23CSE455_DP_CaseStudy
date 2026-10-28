# Change 2: Jupiter extension for a resource created and cleaned up around tests

Baseline: JUnit 6.1.3 (`f59f60d`). Branch `b16-evolution` in the JUnit fork, on top of CH03 and CH01.
Commit: `99987b0` CH02 (new files only).

## Requirement
A Jupiter extension that creates a resource before tests and cleans it up after them.

## What already existed (checked in source, see Part2/evidence/verification.csv D1-07..D1-11)
- **Lifecycle callbacks and `ParameterResolver`:** the raw hooks. With these you write create, store and cleanup yourself, every time.
- **`ExtensionContext.Store`:** closes stored `AutoCloseable` values when their context ends.
- **`@TempDir`:** creates, injects and deletes a resource with a pluggable factory, but **only for `Path`/`File`** (`TempDirectory.java:208-211`).
- **`@AutoClose`:** closes a field after the test or class, but **you still create the resource yourself**, and there is no injection and no scoping.

## Gap, so the extension
JUnit has a complete create–inject–clean-up feature only for temporary directories. CH02 generalises it to any type:

```java
class RepositoryTests {
    @BeforeAll static void seed(@ManagedResource(DbFactory.class) DataSource db) { ... }  // one per class
    @Test void finds(@ManagedResource(DbFactory.class) DataSource db) { ... }             // same instance
}
```

- `ResourceFactory<T>` has `T create(ExtensionContext)` and `default void destroy(T)`. The default closes `AutoCloseable` resources.
- `@ManagedResource(Factory.class)` goes on a method parameter.
- **The lifetime follows the method that first asks for the resource:**
  - `@BeforeAll`/`@AfterAll`: one per class, destroyed after `@AfterAll`, including `@Nested` classes.
  - test, `@BeforeEach` or `@AfterEach`: one per test, shared with that test's `@BeforeEach`, destroyed after its `@AfterEach`.
  - A test that asks for a factory already used in `@BeforeAll` gets the class-wide instance, because the store lookup falls back to the parent (D1-11).

## Extension point or implementation change?
**Existing extension points only. No existing JUnit file was edited.**
- `ParameterResolver` (D3) injects the resource.
- `@ExtendWith` used as a meta-annotation on `@ManagedResource` registers the extension automatically for annotated parameters (`ExtensionUtils.registerExtensionsFromExecutableParameters`, D1-10).
- `ExtensionContext.Store` keeps the resource and destroys it when the context closes. The cleanup ordering comes from the store (D1-07, D1-08).

New files, in `junit-jupiter-api/.../api/extension/support/` (already exported by `module-info`): `ResourceFactory.java`, `ManagedResource.java`, `ManagedResourceExtension.java`.

## Refactoring
**None, and deliberately so.** CH02 adds three new files and changes no existing code, so there is nothing to restructure.
- The nearest smell is the two parallel close paths (`AutoCloseable` vs the deprecated `Store.CloseableResource`, `AbstractExtensionContext.createCloseAction`).
- Removing one would change behaviour for users who disabled closing of `AutoCloseable` values. That would be a behaviour change, not a refactoring.
- CH02 has to support both paths, which is why `Holder` implements both interfaces.

Metrics of the new code (lizard 1.24.1, `Part2/evidence/metrics_after_ch02.txt`):
- Production code: 88 NLOC.
  - `resolveParameter`: NLOC 12, CCN 3.
  - `ResourceFactory.destroy`: CCN 2.
- lizard does not analyse methods declared inside a Java `record`. By lizard's own counting rule (+1 per `if`/`catch`), `Holder.create` has CCN 3 and `Holder.close` has CCN 1, so max CCN = 3.

## Execution order (demo_ch02.log, scenarios 2 and 3)
**Class scope:**
1. `@BeforeAll` parameter resolution → `create`
2. `@BeforeAll`
3. test 1 (reuses the instance)
4. test 2 (reuses the instance)
5. `@AfterAll`
6. class context closed → `destroy`

**Test scope**, for each test:
1. `@BeforeEach` parameter resolution → `create`
2. `@BeforeEach`
3. the test (gets the same instance)
4. `@AfterEach`
5. test context closed → `destroy`
6. only then is the test reported finished. `cleanUp` runs before `reportCompletion` (`NodeTestTask.java:118-121`), which is why a failing `destroy` becomes part of the test's own result.

## Failure handling
| Situation | Behaviour | Evidence |
|---|---|---|
| Test fails | `destroy` still runs (the store is closed in `cleanUp`); the original assertion error is reported | demo 3, test `resourceIsDestroyedWhenTheTestFails...` |
| `create()` throws | `ParameterResolutionException` with the original as cause, the test fails, nothing is stored, `destroy` is not called. In `@BeforeAll` the whole class fails. | demo 4, test `failingCreate...` |
| `destroy()` throws | the owning test fails with `JUnitException: Failed to close extension context`, original as cause | demo 4, test `failingDestroy...` |
| Factory has no no-arg constructor / returns `null` / wrong type | `ParameterResolutionException` naming the parameter or factory | test `invalidUsage...` |
| `@ManagedResource` on a constructor parameter | `ParameterResolutionException: ... only supported on method parameters` | test `invalidUsage...` |
| `junit.jupiter.extensions.store.close.autocloseable.enabled=false` | still destroyed, because `Holder` also implements the deprecated `Store.CloseableResource` (same approach as `TempDirectory.CloseablePath`) | demo 5, test `...ClosingStoredAutoCloseablesIsDisabled` |

## Pattern impact (our Part 1 ids)
| Instance | Status after CH02 | Change |
|---|---|---|
| D3 ParameterResolver (Strategy) | **extended** | new ConcreteStrategy `ManagedResourceExtension` |
| D5 CloseAction (Strategy) | preserved | cleanup runs through JUnit's existing close action; no new close action |
| D6 NamespaceAwareStore (Adapter) | preserved | used through the public `Store` API |
| D1 TempDirFactory (Strategy) | preserved | not touched; `ResourceFactory` follows the same design |
| D8 TestWatcher, D9 Chain, D10 Decorator, D11 Command, all others | preserved | not touched |
| **NEW: Managed Resource Factory (Strategy)** | **newly introduced** (proposed) | Strategy = `ResourceFactory<T>` (with default `destroy`); Context = `ManagedResourceExtension` + `Holder`. ConcreteStrategy is **absent from production code**: it is supplied by users (examples: `HttpServerFactory` in the demo, factories in `ManagedResourceTests`). |
| **NEW: Managed Resource Holder (Adapter)** | **newly introduced** (proposed) | Target = `AutoCloseable` / `Store.CloseableResource` (what the store's close action calls); Adaptee = `ResourceFactory.destroy(T)`; Adapter = `ManagedResourceExtension.Holder` (binds the resource to its factory and exposes `close()`); Client = `AbstractExtensionContext.createCloseAction`. The LLM said Holder is "not a pattern"; corrected in D1-22. |
| replaced / removed | none | |

## Tests
`jupiter-tests/.../api/extension/support/ManagedResourceTests.java`: 7 tests, run through the Jupiter engine test kit:
- one resource per test, shared with `@BeforeEach`, exact create/destroy order;
- class scope through `@BeforeAll`;
- destroyed when the test fails;
- `create` throws;
- `destroy` throws;
- invalid usage (4 cases);
- auto-close flag disabled.

Mutation checks (`mutation_checks_ch02.log`):
- (a) `CloseableResource` fallback removed → the flag-disabled test fails;
- (b) resource kept in the root store (wrong lifetime) → 3 tests fail.

| Run | Before CH02 (`e55fefe`) | After CH02 (`99987b0`) |
|---|---|---|
| all of `jupiter-tests` | 3381 / 344 classes, 0 failed, 165 skipped | 3388 / 345 classes, 0 failed, 165 skipped |

The 165 skipped tests come from JUnit's own tests of conditional execution (JRE version, operating system, environment variables; e.g. `EnabledForJreRangeIntegrationTests` 29, `EnabledOnJreIntegrationTests` 27, `EnabledOnOsIntegrationTests` 15). They are skipped by design on this machine, and the count is the same before and after.

## Files in this folder
- `ch02_extension.diff`
- `before_all_jupiter_tests.log`, `after_all_jupiter_tests.log`, `mutation_checks_ch02.log`
- `demo_ch02.log`: official 6.1.3 cannot compile the tests (`ManagedResource`/`ResourceFactory` missing), then 4 scenarios with a real `HttpServer`; produced by `Part2/code/demo/run_ch02.sh`
