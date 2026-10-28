# Part 2 UML: diagrams that changed

Only instances whose participants changed are redrawn. All other instances keep their Part 1 diagram (`Part1/uml/`).
In each diagram, green participants are new; the stereotype names the change that introduced or refactored them.

| Diagram | Instance | Status |
|---|---|---|
| `A2_after_CH03.puml` | A2 Composed Discovery Filter (Composite) | extended: Leaf `FilterPolicy` |
| `A3_after_CH03.puml` | A3 Post-Discovery Filter Policies (Strategy) | extended: ConcreteStrategy `FilterPolicy`, context method `collectPostDiscoveryFilters` |
| `C1_after_CH01.puml` | C1 Test Execution Listeners (Observer) | extended: ConcreteObserver `ClassSummaryListener`; `SummaryGeneratingListener` refactored |
| `D3_after_CH02.puml` | D3 Parameter Resolution (Strategy) | extended: ConcreteStrategy `ManagedResourceExtension` |
| `N1_Strategy_ResourceFactory.puml` | N1 Managed Resource Factory (Strategy) | newly introduced; ConcreteStrategy absent from production code (user-supplied) |
| `N2_Adapter_ManagedResourceHolder.puml` | N2 Managed Resource Holder (Adapter) | newly introduced |

Checks:
- `java -jar plantuml.jar -checkonly *.puml` → syntax OK.
- Every new implements arrow was compared with its declaration in `Part2/code` (`arrow_check_part2.txt`).
- PNGs are in `png/`.

These diagrams were drawn by Claude Code from the Part 1 diagrams plus the commits; no LLM chat prompt was used.
