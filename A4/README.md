# 23CSE455 Design Patterns Case Study — Team A4

## Project Metadata
- **Course**: 23CSE455 Design Patterns
- **Team**: A4
- **Domain**: Home Automation / Dashboard Architecture
- **Application**: [ha-fusion](https://github.com/knowald/ha-fusion)
- **Baseline Commit**: `65cc1957c39c6005609102c33650c32abc8d12f0`
- **Baseline Release**: `2026.8.2` (default-branch HEAD at the frozen baseline)
- **Baseline Commit Date**: 2026-08-16
- **Inspection Access Date**: 2026-10-11
- **License**: MIT License

---

## Student Information

| Roll Number | Student Name | Batch | Role / Contribution |
| :--- | :--- | :--- | :--- |
| `AM.AI.U4AID23027` | Adwaith S Menon | AIDS | Part 1 discovery (shared with Sai Samay) |
| `AM.SC.U4CSE23153` | Sai Samay | AIDS | Part 1 discovery (shared with Adwaith S Menon) |
| `AM.AI.U4AID23044` | Karthikeya Sai | AIDS | Part 1 verification and inventory/counts; Part 2 evolution and refactoring |
| `AM.AI.U4AID23028` | Amitha K Anilkumar | AIDS | Part 3 implementations in Java, Python, and JavaScript |
| `AM.SC.U4CSE23052` | Meenakshi Manoj | AIDS | Part 3 C++ implementation and report writing |

*Roster, batch, and contribution roles are based on the information supplied by the team.*

---

## Environment & Toolchain Versions

| Tool / Runtime | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v22.15.0` | JavaScript / TypeScript runtime |
| **pnpm** | `12.11.2` | Package manager |
| **Svelte** | `5.56.8` | Reactive UI framework |
| **SvelteKit** | `2.69.2` | Application framework and server routes |
| **Vite** | `8.1.4` | Build tool and bundler |
| **Vitest** | `4.1.10` | Unit test execution |
| **cloc** | `2.10` | Source Lines of Code (LOC) counter |
| **lizard** | `1.24.1` | Cyclomatic complexity analyzer |

---

## Inspection Scope

### Inspected Modules
- `src/lib/Stores.ts`: Global reactive stores, undo/redo history store, and WebSocket entity subscriptions.
- `src/lib/Drawer/HistoryButtons.svelte`: Classic dashboard layout undo/redo Caretaker and snapshot operations.
- `src/lib/Hearth/store.ts`: Hearth UI configuration store, undo/redo stacks, and edit-mode transactional snapshot.
- `src/lib/Hearth/config.ts`: Hearth configuration interfaces, type registries (`RAIL_WIDGET_TYPES`, `OVERVIEW_CARD_TYPES`).
- `src/lib/Hearth/modals.ts`: Entity domain modal parameterized Factory Method.
- `src/lib/Hearth/CardRenderer.svelte`: Polymorphic overview card rendering Strategy/dispatcher.
- `src/lib/Hearth/RailWidgetRenderer.svelte`: Polymorphic rail widget rendering Strategy/dispatcher.
- `src/lib/Conditional.ts` & `src/lib/Types.ts`: Recursive visibility condition tree (Composite / Interpreter pattern).
- `src/lib/Utils.ts`: Dashboard section hierarchy traversal (`findInSections`).
- `src/lib/Modal/PictureElements/konvaBase.ts`, `konvaEditor.ts`, `konvaViewer.ts`: Picture Elements canvas editor (Template Method and Canvas Memento).
- `src/lib/Socket.ts`: Home Assistant WebSocket connection and entity state observer subscription.
- `src/routes/**`: Server routes, translation handlers, and Hearth persistence API endpoints.

### Excluded Modules
- `node_modules/`: External library dependencies.
- `static/`: Static assets (weather SVG icons, theme YAML files, localization JSON dictionaries).
- Build and linter configuration files (`.prettierrc`, `eslint.config.js`, `svelte.config.js`, `vite.config.ts`, `Dockerfile`).

---

## Baseline Verification & Execution Commands

### Dependency Installation
```bash
pnpm install
```

### Running Test Suite
```bash
pnpm test
```
**Baseline Test Result**:
- Test Files: **13 passed (13)**
- Tests: **46 passed (46)**
- Execution Time: **862ms**
- Log file: `data/test_result/baseline_test.log`

### LOC Measurement
```bash
cloc src/
```
**Baseline LOC Breakdown** (measured with `cloc 2.10` on `ha-baseline/src`):
```text
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
Svelte                         261           5232           1862          39908
TypeScript                      64           1277           1157           9112
CSS                              3             43             18            238
Markdown                         1             32              0            104
HTML                             1              0              0             15
-------------------------------------------------------------------------------
SUM:                           330           6584           3037          49377
-------------------------------------------------------------------------------
```

### Cyclomatic Complexity Measurement
```bash
lizard src/lib/Conditional.ts
```

### Application Commands and Configuration

Run commands from the relevant application root: `data/code/` for the frozen
baseline and `Part2/code/` for the evolved source.

| Command | Purpose | Recorded result |
| :--- | :--- | :--- |
| `pnpm install` | Install dependencies | Performed for the baseline test run |
| `pnpm dev -- --open` | Start local development server | Not run for this case study; requires Home Assistant configuration |
| `pnpm build` | Production build | Not run; no result claimed |
| `pnpm test` | Run Vitest suite | Baseline: 13 files / 46 tests passed. Final evolved: 15 files / 68 tests passed |
| `pnpm lint` | Prettier and ESLint checks | Not run; no result claimed |
| `pnpm check` | Svelte/TypeScript check | Final evolved check: 0 errors, 0 warnings |

`HASS_URL` is required to connect the application to Home Assistant; `TZ` is
optional. A reachable Home Assistant instance is required for application
operation. The frozen baseline `package.json` has no `engines` field. The test
and type-check outcomes above come from saved logs under `data/test_result/`.

### Measurement Rules

- `cloc` counts production code lines and excludes blank/comment lines.
- Lizard 1.24.1 reports maximum function CCN; the exact input scope is recorded
  alongside each Part 2 metric log and in `Part3/evidence/measurement_notes.md`.
- Part 3 records runner-body time after one warm-up and five measured runs. The
  timer excludes process/VM/interpreter startup. Original benchmark hardware
  details were not retained; see the Part 3 report for limitations.

---

## Repository & Dataset Structure

Per the course guidelines, datasets are consolidated in `data/` to ensure single-source-of-truth consistency across parts:

```text
A4/
|-- README.md                         # This file: metadata, versions, commands, scope
|-- A4_Report.tex                     # LaTeX report source
|-- A4_Report.pdf                     # Compiled report PDF
|-- data/
|   |-- code/                         # Untouched baseline application source (no node_modules, no .git)
|   |-- test_result/                  # Actual test logs and execution records
|   |-- patterns.csv                  # Canonical baseline inventory; Part 1 re-audit deferred
|   |-- pattern_counts.csv            # Tracked counts by pattern and source version
|   |-- patterns_evolution.csv        # Part 2: Evolution tracking across baseline and CH01-CH03
|   |-- pattern_candidate_observations.csv # Rejected/uncertain candidate evidence
|   |-- cross_language.csv            # Part 3: canonical 24-row metrics and test evidence
|   `-- llm.csv                       # AI interaction logging with verification and evaluation
|-- Part1/
|   |-- pattern_architecture/         # Architecture and pattern UML diagram sources & images
|   |-- Part1_prompt.txt              # Part 1 discovery task specification
|   |-- Part1_prompt_Sai_Samay.txt   # Reconstructed role-specific P1 discovery brief
|   |-- llm/historical_discovery_prompt.txt # Historical Gemini prompt linked to its saved output
|   `-- llm/                          # Raw inputs/outputs, P1 audit, and verification files
|-- Part2/
|   |-- Part2_Report.md               # Draft-ready report section for template sections 3 and 3.1
|   |-- Part2_Report.pdf              # Rendered Part 2 report section
|   |-- evolution_metrics.csv         # Per-change source LOC and cyclomatic complexity evidence
|   |-- evolution_evidence_notes.md   # Snapshot, counting, and audit-scope notes
|   |-- diagrams/                     # Updated evolution diagram sources and SVG rendering
|   |-- evidence/                      # Index to diffs, logs, snapshots, and datasets
|   |-- llm/                           # Part 2 prompts, inputs, outputs, and verification records
|   |-- code/
|   |   |-- snapshots/                # Versioned CH01 and CH02 source snapshots
|   |   `-- changes/
|   |       |-- Change1/              # Requirement, criteria, diff, and vitest log for CH01
|   |       |-- Change2/              # Requirement, criteria, diff, and vitest log for CH02
|   |       `-- Change3/              # Requirement, criteria, diff, and vitest log for CH03
|   |-- diagrams/                     # Updated UML diagrams reflecting evolved architecture
|   |-- Part2_prompt.txt              # Reconstructed Part 2 reference task prompt; not historical transcript
|   `-- llm/                          # Raw inputs/outputs, scoped discovery audit, and verification files
`-- Part3/
    |-- Part3_prompt.txt               # Part 3 task specification
    |-- Part3_Report.md/.pdf          # Cross-language comparison and findings
    |-- test-cases/                   # Shared behavior specifications
    |-- evidence/                     # Test logs, metrics, methods, and verification
    |-- <pattern>/<language>/          # Java, Python, JavaScript, and C++ snippets
    `-- llm/                          # Prompts, inputs, outputs, and activity log
```

The consolidated report source is `A4_Report.tex`; the matching PDF was recompiled in Overleaf on 2026-10-11 after the final report edits. If the TeX changes again, regenerate the PDF before submission. The report integration provenance is in `llm/`. The scoped P1 discovery ledger, candidate dispositions, and negative-search record are in `Part1/llm/p1_discovery_audit.md`; confirmed-looking P1 rows are in `Part1/llm/patterns_p1_discovery.csv`.

Part 3 uses `Part3/Part3_Report.md` and `Part3/Part3_Report.pdf` as its report
pair. Its canonical dataset is `data/cross_language.csv`; `Part3/llm/pattern_crosslanguage.csv` is retained only as a historical model output, not as the current dataset. The older slide in `Part3/llm/` is retained as a historical visual summary.
