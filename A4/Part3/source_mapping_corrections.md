# Verified source mapping for Part 3

The original `llm/input_code_context.md` is retained as supplied input. It
contains several source paths that do not exist in the supplied baseline tree.
The verified mappings below use `data/code/` (baseline commit
`65cc1957c39c6005609102c33650c32abc8d12f0`) and the Part 2 snapshots where
noted. Exact participant line ranges remain in `data/patterns.csv` and
`data/patterns_evolution.csv`.

| Part 3 pattern / instance | Verified application source | Notes |
| --- | --- | --- |
| Composite / Visibility Condition Tree | `src/lib/Types.ts`; `src/lib/Conditional.ts` | Condition types and recursive evaluation are files, not a `src/lib/Conditional/` directory. |
| Observer / Home Assistant WebSocket Entity Subscriptions | `src/lib/Socket.ts`; `src/lib/Stores.ts` | Subscription callback updates the entity-state store consumed by reactive UI. |
| Memento / Hearth Config History & Edit Transaction | `src/lib/Hearth/store.ts`; `src/lib/Hearth/config.ts`; evolved caretaker in `src/lib/Hearth/historyManager.ts` | The `historyManager.ts` path belongs to the Part 2 evolved source, not the original baseline. |
| Strategy / Visibility Condition Evaluator Dispatch | `src/lib/Conditional.ts`; `src/lib/Types.ts`; CH01 snapshot under `Part2/code/snapshots/Change1/` | Strategy was introduced during CH01; it was not a baseline Part 1 finding. |
| Factory Method / Entity Domain Modal Factory | `src/lib/Hearth/modals.ts`; `src/lib/Utils.ts`; `src/lib/Modals.ts`; concrete files under `src/lib/Modal/` | There is no `src/lib/Modals/domainFactory.ts` in the supplied source. |
| Template Method / Picture Elements Konva Canvas Base | `src/lib/Modal/PictureElements/konvaBase.ts`; `konvaViewer.ts`; `konvaEditor.ts` | The source is under `Modal/PictureElements/`, not `src/lib/PictureElements/`. |

The Part 1 baseline sweep was deferred. Part 3 therefore compares the six
pattern types in the tracked cross-version inventory; it does not assert that
all six were independently confirmed in the baseline. The baseline inventory
has five types; Strategy first appears in the CH01 evolution record.
