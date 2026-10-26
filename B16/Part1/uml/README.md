# Part 1 UML – B16

Source: Part1/llm/output_10_uml.md (prompt 10). The tables were not pasted with the prompt, so the model
used its own ids. `split_and_check.py` split the blocks into one `.puml` per instance, renamed them to our
ids, and checked every implements (..|>) / extends (--|>) arrow against the class declarations in data/code
(result: arrow_check.txt – 98 arrows OK, lambdas/JDK types not checkable).

| Model id | Our id | Note |
|---|---|---|
| A1–A7, B1–B8, C1–C4, D1–D11 | same | |
| B9 (Composite reused) | – | not drawn: not a separate instance (it is A1 with NodeTestTask as client) |
| B10 | B9 | Command |
| B11 | B10 | Null Object |
| C5 (ListenerRegistry factory) | – | not drawn: UNCERTAIN in our records |
| C6 | C5 | Adapter |
| C7 | C6 | Decorator |
| C8 | C7 | Null Object |

Human corrections:
- A2: removed EngineFilter as a Leaf. EngineFilters are applied by EngineFilterer, which never uses
  Filter.composeFilters / CompositeFilter (grep of EngineFilterer.java: 0 matches).

Rendered images: png/<id>.png (PlantUML 1.2025.4, smetana layout).

## Diagrams aligned with the counted records (final review)
`align_with_records.py` makes every diagram agree with its record in `data/patterns.csv`. The Part 2 diagrams are aligned with `Part2/pattern_evolution.csv` in the same way.
- **Legend:** each diagram has a "Counted participants" legend listing exactly the participants that are counted. Any that are not drawn are marked "(not drawn)".
- **Grey classes:** classes drawn with a pattern role that are not participants of the record are shown grey and marked "not counted". Examples: the `ClassNameFilter` family and `EngineFilter` in A3, which are filter strategies applied by other contexts, and further resolvers or conditions in D3/D4. They are real classes, shown only for context.
- **Counts:** the counts are unchanged.
