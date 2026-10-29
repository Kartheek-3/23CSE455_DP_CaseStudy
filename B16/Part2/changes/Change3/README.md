# Change 3: configurable filtering policy for test selection

Baseline: JUnit 6.1.3 (`f59f60d`). Branch `b16-evolution` in the JUnit fork.
Commits: `68a60e4` CH03a (refactoring), `6f98fbf` CH03b (feature).

## Requirement
Extend test selection with a filtering policy that can be configured without code.

## What already existed (checked in source, see Part2/evidence/verification.csv D1-12..D1-16)
- `PostDiscoveryFilter` (Strategy A3) with ready-made `TagFilter` and `MethodFilter`, combined with AND by `CompositeFilter` (Composite A2).
- These filters are only built in code, for example by the Console Launcher or a build tool, and passed on the request.
- Filters registered through `ServiceLoader` are created before any request exists, and `apply(TestDescriptor)` never receives the configuration. So no existing filter can be set from `junit-platform.properties`.

## Gap, so the extension
There is one setting for "this set of tests" (tag expressions and/or method-name patterns) and a mode for what to do with it:

| Key | Values | Default |
|---|---|---|
| `junit.platform.filter.policy.mode` | `off`, `exclude`, `only` (case-insensitive) | `off` |
| `junit.platform.filter.policy.tags` | comma-separated tag expressions | none |
| `junit.platform.filter.policy.methods` | comma-separated regexes on `com.x.Foo#method` | none |

A test is matched if it matches **any** tag expression or method pattern (OR). Use case: a normal CI job runs with `mode=exclude`, and a quarantine job runs with `mode=only`, both using the same flaky list.

## Extension point or implementation change?
**Implementation change.** With only the existing `ServiceLoader` extension point, a filter cannot see the request's configuration. It would have to read system properties itself, or catch the request in a `LauncherDiscoveryListener` and keep it in static state, which is global mutable state and unsafe with concurrent launchers. Both alternatives were rejected.

Files changed:
- new `junit-platform-launcher/.../launcher/core/FilterPolicy.java` (package-private, so no new public type)
- `LauncherConstants.java`: 3 documented keys (`@API(status = EXPERIMENTAL, since = "6.2")`)
- `EngineDiscoveryOrchestrator.java`: CH03a refactoring plus one line in `collectPostDiscoveryFilters`

## Refactoring (CH03a, before the feature)
**Extract Method:** the filter-list assembly is moved out of `discoverSafely` into `collectPostDiscoveryFilters(request)`, so the new filter source is added in one place.
- This is a *preparatory* refactoring: make the change easy, then make the easy change. It is not a Long Method fix, because `discoverSafely` was only 24 NLOC with CCN 3 (LLM claim D1-20 corrected).
- Behaviour is unchanged: launcher tests were 382/382 before and 382/382 after CH03a.

| Metric (lizard 1.24.1) | Before `f59f60d` | After CH03b `6f98fbf` |
|---|---|---|
| `discoverSafely` NLOC / CCN / tokens | 24 / 3 / 216 | 22 / 3 / 194 |
| `collectPostDiscoveryFilters` NLOC / CCN | (inline) | 6 / 1 |
| `EngineDiscoveryOrchestrator.java` NLOC / functions / avg CCN | 202 / 18 / 1.7 | 206 / 19 / 1.6 |
| `LauncherConstants.java` NLOC | 40 | 46 |
| `FilterPolicy.java` NLOC / functions / max CCN | (new) | 74 / 4 / 5 (`fromConfiguration`) |

Raw output: `Part2/evidence/metrics_before.txt`, `Part2/evidence/metrics_after_ch03.txt`.

## Execution order (shown in demo_ch03.log, scenarios 3-5)
1. `LauncherFactory.create` loads the `ServiceLoader` filters. The policy is **not** created here.
2. `Launcher.discover/execute` → `EngineDiscoveryOrchestrator.discover` → `launcherDiscoveryStarted` → each engine discovers its tree.
3. `collectPostDiscoveryFilters` builds the list in this order: ServiceLoader filters, then request filters (for example the console's `--include-tag`), then **`FilterPolicy.fromConfiguration`**. This is where the configuration is parsed and validated, once per discovery.
4. `applyPostDiscoveryFilters` ANDs the filters (`CompositeFilter`) and visits every descriptor top-down. **`FilterPolicy.apply`** runs for each descriptor, and excluded leaves are removed. The launcher logs the reason at CONFIG level, for example `0 containers and 2 tests were excluded by filter policy (mode=exclude)`.
5. `prune` removes empty classes. The TestPlan is built, then execution starts.

Filtered-out tests are **absent** from the test plan, not "skipped", so execution listeners never see them. Because the policy is added last and the filters are ANDed, it can only narrow other filters and never re-include a test (scenario 5).

## Failure handling
| Situation | Behaviour | Evidence |
|---|---|---|
| A selected test fails | Not affected, because the policy runs before execution | demo scenario 4 |
| Invalid mode (`bogus`) | `JUnitException` naming `junit.platform.filter.policy.mode`; discovery fails, no test runs, console exit code 255 | test [1], demo 6 |
| `exclude`/`only` with neither tags nor methods | `JUnitException` naming the mode key | test [2], demo 8 |
| Invalid tag expression (`flaky &`) | `JUnitException` naming `...tags`, original `PreconditionViolationException` kept as cause | test [3], demo 7 |
| Invalid regex (`[`) | `JUnitException` naming `...methods`, `PatternSyntaxException` as cause | test [4] |
| Exception inside `apply` | Cannot happen by design: all parsing is in `fromConfiguration`. This matters because the orchestrator does not catch filter exceptions (D1-14). | code review |

Failing fast was chosen on purpose: silently running every test would hide a broken quarantine setting.

Known limit: values are split on `,`, so a method regex cannot contain a comma (marked with `ponytail:` in `FilterPolicy`).

## Pattern impact (our Part 1 ids)
| Instance | Status after CH03 | Change |
|---|---|---|
| A3 Post-Discovery Filter Policies (Strategy) | **extended** | new ConcreteStrategy `FilterPolicy`; new context method `collectPostDiscoveryFilters` decides which strategies take part |
| A2 Composed Discovery Filter (Composite) | **extended** | `FilterPolicy` is a new Leaf combined by `CompositeFilter`; the composite itself is unchanged |
| A1 Test Descriptor Tree (Composite) | preserved | removal and pruning unchanged |
| A6 Discovery Event Notification (Observer) | preserved | deliberately not used (static-state workaround rejected) |
| all other 31 instances | preserved | not touched |
| newly introduced / replaced / removed | none | `FilterPolicy` ORs `Predicate`s, not `PostDiscoveryFilter`s, so by our Composite rule it is not a new Composite; `mode` is a boolean flag, not a Strategy (D1-18) |

## Tests
`platform-tests/.../launcher/core/FilterPolicyTests.java`: 9 tests, one per acceptance criterion: off/unset is a no-op; exclude removes tests and prunes empty classes; tags and methods are ORed; only; the policy narrows request filters; 4 invalid configurations.

| Run | Before (`f59f60d`) | After CH03a | After CH03b |
|---|---|---|---|
| `org.junit.platform.launcher.*` | 382 / 46 classes, 0 failed | 382, 0 failed | 391 / 47 classes, 0 failed |
| all of `platform-tests` | 2452, 0 failed, 6 skipped | (not run) | 2461, 0 failed, 6 skipped |

Mutation check: with the wiring line commented out, 8 of the 9 new tests fail. Only "off/unset is a no-op" passes, as it should (`mutation_check_without_wiring.log`).

## Files in this folder
- `ch03a_refactoring.diff`, `ch03b_feature.diff`, `ch03_full.diff`
- `refactoring_launcher_tests.log`, `after_launcher_tests.log`, `after_all_platform_tests.log`, `mutation_check_without_wiring.log`
- `demo_ch03.log`: 8 scenarios, official 6.1.3 jar vs evolved jar; produced by `Part2/code/demo/run_ch03.sh`
- Baseline logs: `../baseline_launcher_tests.log`, `../baseline_all_platform_tests.log`; all counts are in `../launcher_tests_by_snapshot.txt`
