# P1 pattern discovery audit addendum

Date: 2026-10-11  
Repository: `https://github.com/knowald/ha-fusion`  
Frozen source: `Original@65cc1957c39c6005609102c33650c32abc8d12f0`  
Baseline tag: `2026.8.2` (default-branch HEAD); commit date `2026-08-16`.  
Line-number source: shell (`nl -ba`) against the frozen source copy in `data/code/`; the copy matches the commit above.

## Capability check

| Capability | Result |
|---|---|
| Fetch/clone a pinned commit | Yes; baseline checkout and SHA are recorded. |
| Open source files | Yes. |
| Obtain exact line numbers | Yes; shell line-number output. |
| Run shell commands | Yes. This audit was source-only; no application tests were run. |

## P1 scope and findings

### A. Smart devices and entities

The application does not define a class-based domain model for Home Assistant entities. It imports `HassEntity` and `HassEntities` from `home-assistant-js-websocket`; its own configuration types represent dashboard items and entity references. For example, `ButtonItem` stores an `entity_id`, a generic `state`, optional service/template fields, and device-specific display options (`data/code/src/lib/Types.ts:88-119`); `EntitiesItem` stores explicit entity IDs or a wildcard (`Types.ts:205-211`); Hearth `EntityRef` stores an entity string and presentation/control flags (`Hearth/config.ts:35-49`). `Stores.states` holds the Home Assistant entity map (`Stores.ts:21-25`).

The inspected application source shows typed configuration variants and domain-based rendering/control, but no Ha-Fusion-owned abstract entity class with polymorphic domain subclasses. The actual Home Assistant entity representation is dependency-provided. Device capability and behavior are selected using entity IDs, domain strings, attributes, and state strings in functions and components.

### B. Device control

A button derives the target ID from its selected item (`Main/Button.svelte:41`). In normal mode its click handler calls `toggle()` (`Button.svelte:755-767`); `toggle()` asks `getTogglableService(entity)` for a domain/state-specific service (`Button.svelte:189-218`; `Utils.ts:96-149`) and passes the selected service plus `entity_id` to `callService` (`Button.svelte:239-244`). A configured service template is a separate direct branch (`Button.svelte:195-212`). The application subscribes to the resulting Home Assistant entity-state stream through the callback passed in `authentication` (`Socket.ts:106-116`), updates `states` (`Stores.ts:23`), and consumes that store in UI components (`Button.svelte:100-118`; `Main/Entities.svelte:65-80`). The source trace ends at the Home Assistant library boundary; remote network delivery and device behavior are not asserted from this code.

### C. Preferences and settings

`+page.server.ts` loads `configuration.yaml` and `dashboard.yaml`, adds `HASS_URL`/proxy-derived `hassUrl`, and returns the config and dashboard (`routes/+page.server.ts:33-67`). `+page.svelte` seeds the `configuration` and `dashboard` stores from that result (`routes/+page.svelte:30-50`). Hearth preferences are represented by `HearthConfig` (`Hearth/config.ts:324-341`), edited through `updateConfig()` (`Hearth/store.ts:43-53`), and saved by `saveEdit()` as a revisioned POST (`Hearth/store.ts:112-148`). The server endpoint checks the revision and serializes/writes YAML (`routes/_api/save_hearth/+server.ts:94-140`). The inspected path shows file-based configuration, in-memory Svelte stores, and an HTTP save route; no database-backed store or separate repository abstraction was found in these files.

## Inspected and excluded files

| Area | Files opened and reason |
|---|---|
| Entities (A) | `data/code/src/lib/Types.ts` — dashboard/entity item shapes, `Section`, `Condition`, and configuration types. |
| Entities (A) | `data/code/src/lib/Hearth/config.ts` — Hearth entity references, settings shape, and card/widget variants. |
| Entities (A) | `data/code/src/lib/Stores.ts` — shared entity/config/dashboard stores. |
| Entities (A) | `data/code/src/lib/Main/Entities.svelte` — selects and renders entity rows from IDs and current states. |
| Preferences/history | `data/code/src/lib/Drawer/HistoryButtons.svelte`, `data/code/src/lib/Drawer/ViewButton.svelte` — snapshot registration/restoration and a dashboard-edit callback caller. |
| Control (B) | `data/code/src/lib/Main/Button.svelte` — selected entity, click handling, service template, state response, modal path. |
| Control (B) | `data/code/src/lib/Utils.ts` — section traversal, domain extraction, and domain/state service mapping. |
| Control (B) | `data/code/src/lib/Socket.ts` — app connection setup and entity-state callback boundary. |
| Control (B) | `data/code/src/lib/Hearth/modals.ts`, `data/code/src/lib/Modals.ts` — domain selection and modal opening. |
| Preferences (C) | `data/code/src/routes/+page.server.ts`, `data/code/src/routes/+page.svelte` — file load and store initialization. |
| Preferences (C) | `data/code/src/lib/Hearth/store.ts`, `data/code/src/lib/Hearth/config.ts` — preferences model, editing, undo, save request. |
| Preferences (C) | `data/code/src/routes/_api/save_hearth/+server.ts` — revision check and YAML persistence. |
| Related visibility | `data/code/src/lib/Conditional.ts`, `data/code/src/lib/Hearth/VisibilityGate.svelte` — entity/screen condition dispatch and the borderline responsive-query observer candidate. |
| Related settings rendering | `data/code/src/lib/Hearth/CardRenderer.svelte` — type-based overview card dispatch considered for Strategy. |
| Related dashboard layout | `data/code/src/lib/Types.ts`, `data/code/src/lib/Utils.ts` — recursive section shape and lookup. |
| Excluded | `node_modules/`, `.svelte-kit/`, `build/`, generated output, and `static/` assets — dependency, generated, or non-source material. |
| Excluded from detailed classification | Automation rules, notifications, and detailed Home Assistant protocol/library internals — P2 scope. The entity callback was followed only to establish C5. |
| Excluded | Unrelated tooling/configuration modules not used by the A/B/C flows. |

## Architecture trace

```text
User click
  -> Main/Button.svelte: click handler and toggle()
  -> Utils.ts: getTogglableService(entity)
  -> Main/Button.svelte: callService(connection, domain, service, { entity_id })
  -> Home Assistant library boundary / remote service (remote behavior not inspected)
  -> Socket.ts: authentication() callback passed to subscribeEntities()
  -> Stores.ts: states store
  -> Main/Button.svelte / Main/Entities.svelte: reactive state consumption

Server YAML files
  -> routes/+page.server.ts: load()
  -> routes/+page.svelte: seed configuration/dashboard stores
  -> Hearth UI/store.ts: updateConfig() and saveEdit()
  -> routes/_api/save_hearth/+server.ts: revision check and YAML write
```

## Candidate ledger

Statuses below are P1 discovery labels, not final verification. The CSV contains only the five confirmed-looking collaborations. The P2-owned `data/patterns.csv` currently includes C6 as Factory Method; P1 leaves that classification uncertain pending role/intent reconciliation, and this addendum does not alter P2-owned counts.

| ID | Pattern | Instance | Status / confidence | Why considered and disposition |
|---|---|---|---|---|
| C1 | Memento | Classic Dashboard Edit History | Confirmed-looking / High | Dashboard snapshots are serialized, indexed, and restored through the history store. Independent from Hearth history. Included in CSV. |
| C2 | Memento | Hearth Config History & Edit Transaction | Confirmed-looking / High | Hearth settings mutations keep snapshots for undo/redo; cancel restores an edit-session snapshot. Included in CSV. |
| C3 | Composite | Dashboard Section Layout Hierarchy | Confirmed-looking / High | `Section` can hold leaf items or nested sections; `findInSections()` recursively searches the tree. Included in CSV. |
| C4 | Composite | Visibility Condition Tree | Confirmed-looking / High | `Condition` uses nested `and`/`or` nodes and leaf conditions; handlers recurse via a common dispatcher. Included in CSV. |
| C5 | Observer | Home Assistant Entity State Subscription | Confirmed-looking / Medium | App callback publishes received entities to `states`; UI components consume the store. Library/Svelte details remain caveats. Included in CSV. |
| C6 | Factory Method (or simple factory) | Entity Domain Modal Selection | Uncertain / Medium | Domain data selects and opens concrete modal components (`Hearth/modals.ts:11-171`; `Utils.ts:74-76`; `Modals.ts:17-21`). The code has a function switch and imported products, but no creator hierarchy or overridable creation method; P2 should decide whether this is GoF Factory Method or a simple factory. Excluded from discovery CSV pending verification. |
| C7 | Strategy | Domain-Specific Device Service Selection | Rejected / High | `getTogglableService()` uses one switch to return a service string (`Utils.ts:96-149`); the caller invokes `callService` (`Button.svelte:215-244`). There are no interchangeable strategy objects/functions or a context delegating to them. |
| C8 | State | Entity-Specific Control State | Rejected / High | The app consumes `HassEntity` state strings/attributes and branches on domain/state; no entity state objects encapsulate transitions or behavior (`Button.svelte:22,48-57`; `Utils.ts:96-149`). |
| C9 | Command | Button Service Request | Rejected / High | The click handler directly invokes `callService` with arguments; no application command object, invoker/receiver separation, or queued command lifecycle appears in the inspected flow (`Button.svelte:189-244`). |
| C10 | Repository / DAO | Hearth Preference Persistence | Rejected / Medium | The page load reads YAML and the endpoint writes YAML directly; the inspected flow has no repository interface or interchangeable persistence implementation (`routes/+page.server.ts:33-67`; `_api/save_hearth/+server.ts:94-140`). |
| C11 | Observer | Responsive Media-Query Visibility | Uncertain / Medium | `VisibilityGate.svelte` registers a `MediaQueryList` change listener, updates component state, and derives visibility (`Hearth/VisibilityGate.svelte:14-48`). The event source is browser-provided and rendering/state notification is Svelte-driven; P2 should decide whether to count it as an application pattern. |
| C12 | Strategy | Hearth Overview Card Renderer | Rejected / High | `CardRenderer.svelte` uses one `if/else` chain over `card.type` to choose components; the inspected code has no strategy interface/object or context delegating to interchangeable renderers (`Hearth/CardRenderer.svelte:27-57`). |

## Confirmed-looking candidate records

### C1 — Memento: Classic Dashboard Edit History

- Participants: `Originator=dashboard` (`Stores.ts:29`); `Memento=history` and `Caretaker/Index=historyIndex` (`Stores.ts:147-148`); `Registration=historyUpdater`, `Callback-Store=record` (`Stores.ts:149-152`); `Caretaker=HistoryButtons.svelte` (`Drawer/HistoryButtons.svelte:18-81`); one callback caller `Invoker=ViewButton.svelte` (`Drawer/ViewButton.svelte:22-31`).
- Collaboration: `HistoryButtons.svelte` registers `snapshot` through `historyUpdater`; snapshot serializes `$dashboard`, appends it to `$history`, and updates `$historyIndex`; `ViewButton.svelte` mutates the dashboard and invokes `$record()`; navigation parses a selected snapshot back into `$dashboard`.
- Evidence (shell line numbers):
  - `Stores.ts:147-152`: `export const history = writable<string[]>([]);`, `export const historyIndex = writable<number>(0);`, `export const record = writable<() => void>(() => {});`, and `historyUpdater()` sets the callback.
  - `HistoryButtons.svelte:18`: `historyUpdater(snapshot)` registers the snapshot callback.
  - `HistoryButtons.svelte:43-53`: `snapshot()` serializes `$dashboard` and appends the result to `$history`.
  - `ViewButton.svelte:22-31`: a dashboard edit calls `$record()` after changing the views array.
  - `HistoryButtons.svelte:75-80`: `set()` updates the index and restores `$dashboard` with `JSON.parse`.
- Intent and caveat: User layout edits can be undone/redone from saved snapshots. The roles are merged across module-level Svelte stores and functions; there is no dedicated Memento class.

### C2 — Memento: Hearth Config History & Edit Transaction

- Participants: `Originator=hearthConfig` (`Hearth/store.ts:18`); `MementoType=HearthConfig` (`Hearth/config.ts:324-341`); caretaker stacks/snapshot and update/undo/redo/transaction functions (`Hearth/store.ts:32-33,43-69,92-110`).
- Collaboration: `updateConfig()` stores prior config, clones and mutates it; undo/redo move snapshots between arrays; edit-mode entry captures a rollback snapshot and cancel restores it.
- Evidence:
  - `Hearth/store.ts:43-50`: `undoStack.push(config)`, bounded history, clone, mutate, and return.
  - `Hearth/store.ts:55-68`: undo and redo transfer snapshots and restore `hearthConfig`.
  - `Hearth/store.ts:94-103`: edit entry snapshots current config; cancel restores it.
- Intent and caveat: Hearth preferences support reversible changes and transaction cancellation. The caretaker and originator are functions/stores/arrays, not separate classes.

### C3 — Composite: Dashboard Section Layout Hierarchy

- Participants: `Component/Composite=Section`, `LeafData=Item` (`Types.ts:42-56`); recursive `findInSections` and calling `getSelected` (`Utils.ts:25-60`).
- Collaboration: Stack sections contain nested sections; sections also contain card items. `getSelected()` calls `findInSections()`, which searches the current section and recursively descends into nested stacks.
- Evidence:
  - `Types.ts:45-49`: `Section` declares `items?: Item[]` and visibility.
  - `Types.ts:52-56`: `Section` declares stack `type` and `sections?: Section[]`.
  - `Utils.ts:52-58`: stack-type check followed by recursive `findInSections()` call.
- Intent and caveat: A dashboard layout can be handled as nested parts. The shared role is one TypeScript interface and functions rather than a component class hierarchy.

### C4 — Composite: Visibility Condition Tree

- Participants: `Component/Composite/Leaf=Condition` (`Types.ts:58-69`); `validateCondition`, `handleAnd`, `handleOr`, leaf handlers, and `handleAllConditions` (`Conditional.ts:58-90,95-127,132-163,179-216`).
- Collaboration: `validateCondition()` selects a handler from the discriminant; `handleAnd()`/`handleOr()` recurse through child conditions by calling that dispatcher; leaf functions evaluate state, numeric state, or screen conditions.
- Evidence:
  - `Types.ts:58-63`: `Condition` has the `and`/`or` discriminants, child array, entity, and state fields.
  - `Conditional.ts:75-88`: the dispatcher routes `and`, `or`, `state`, `numeric_state`, and `screen` variants.
  - `Conditional.ts:140-143`: `handleAnd()` recursively invokes `validateCondition()` for child conditions.
  - `Conditional.ts:158-161`: `handleOr()` does the same for alternatives.
- Intent and caveat: Nested boolean conditions can be composed and evaluated through one function entry point. This is function-based TypeScript, not polymorphic objects.

### C5 — Observer: Home Assistant Entity State Subscription

- Participants: `SubscriptionBridge=authentication` (`Socket.ts:61-64,106-116`); `PublishedState=states` (`Stores.ts:23`); `ReactiveClient=Entities.svelte` (`Main/Entities.svelte:19-36,65-80`).
- Collaboration: `authentication()` creates and stores a connection, passes a callback to `subscribeEntities()`, and sets every received entity map into `states`; entity UI derives IDs and reads the matching state.
- Evidence:
  - `Socket.ts:106-109`: connection creation and storage.
  - `Socket.ts:115-116`: subscription callback writes received entities into `states`.
  - `Stores.ts:21-24`: shared connection and entity stores.
  - `Entities.svelte:65-80`: rows read the reactive entity map and render current state.
- Intent and caveat: Entity updates reach interested UI without polling. The Home Assistant subscription and Svelte store notification mechanism are dependency/framework APIs; only Ha-Fusion's callback, state publication, and UI consumption are attributed to the app.

## Uncertain-candidate checks

- **C6, entity domain modal selection:** source evidence shows `openEntityModal()` maps domains to imported modal components and calls `openModal()`. What is missing for GoF Factory Method is a creator abstraction and overridable factory method; a simple functional factory/dispatcher is a plausible alternative. P2 should compare the pattern's intent with the actual roles and decide whether the final inventory should retain Factory Method.
- **C11, responsive media-query visibility:** `VisibilityGate.svelte` installs a `MediaQueryList` listener, updates local state, and derives visibility. The event source is a browser API and the state/rendering subscription is mediated by Svelte. P2 should decide whether the application-level listener/state collaboration is substantial enough to count as Observer or is primarily a platform/framework idiom.

## Searched, no convincing evidence found

These are scoped findings from inspected P1 paths, not repository-wide absence claims.

- **Strategy for device control:** domain/state switch returns a service string; no interchangeable strategies or delegation context.
- **State for entity behavior:** entity state is data consumed by shared functions/components; no state objects own transitions or behavior.
- **Command for button actions:** the component calls the service API directly; no command objects or command lifecycle.
- **Repository/DAO for preferences:** inspected routes read/write YAML directly; no application persistence abstraction was found.
- **Abstract Factory/Builder for smart-device objects:** inspected types/config and modal flow do not create families of domain model objects through builder/creator roles.
- **Strategy for overview card rendering:** `CardRenderer.svelte` branches on `card.type` and renders imported components directly; no interchangeable rendering strategies are present (C12).
- **GRASP Controller as a separate application layer:** the UI component handles its click and delegates service mapping to a utility; no distinct system-controller participant appears in this path.
- **Application-level Singleton for entity models:** shared stores are Svelte store instances exported from a module; that alone is not evidence of a Ha-Fusion-owned Singleton collaboration.

## Deferred to P2

Automation rule design, notification patterns, and detailed communication/protocol pattern classification were not swept. Communication code was followed only to establish C5; detailed classification remains with P2.

## Preliminary counts (P1 discovery, not final totals)

- Confirmed-looking CSV rows / instances: **5** (`C1`, `C2`, `C3`, `C4`, `C5`).
- Distinct pattern types: **3** — Memento (`C1`, `C2`), Composite (`C3`, `C4`), Observer (`C5`).
- Unique participant symbols after deduplication across CSV rows: **32** — `dashboard`, `history`, `HistoryButtons.svelte`, `historyIndex`, `historyUpdater`, `record`, `ViewButton.svelte`, `hearthConfig`, `HearthConfig`, `undoStack`, `redoStack`, `editSnapshot`, `updateConfig`, `undoConfig`, `redoConfig`, `enterEditMode`, `cancelEdit`, `Section`, `Item`, `findInSections`, `getSelected`, `Condition`, `validateCondition`, `handleAnd`, `handleOr`, `handleState`, `handleNumericState`, `handleScreen`, `handleAllConditions`, `authentication`, `states`, `Entities.svelte`.
- Concrete participant classes (`class` keyword): **0**. The listed roles are TypeScript interfaces/types, module stores/arrays, functions, and a Svelte component.
- Uncertain candidates: **2** (`C6`, `C11`). Rejected candidates: **5** (`C7`-`C10`, `C12`).

## Audit checks

| Check | Result | Note |
|---|---|---|
| Frozen SHA | Pass | Matches `65cc1957c39c6005609102c33650c32abc8d12f0`; source copy is the frozen baseline. |
| Cited paths and line ranges | Pass | Opened during this audit; CSV locations are validated against the files. |
| Participant symbols | Pass with caveats | Symbols are real app symbols; dependency and framework roles are called out, not counted as app implementations. |
| Candidate duplication | Pass | Each C ID describes one collaboration; the two Mementos and two Composites are separate state/tree systems. |
| Confirmed-only CSV | Pass | Only C1-C5 are exported; C6, C11, and C7-C10/C12 remain in this audit note. |
| P1/P2 boundary | Pass | Automation, notifications, and detailed protocol classification are deferred. |
| Exhaustiveness | Limited | The scoped source paths were inspected; no claim is made about every file or pattern in the whole repository. |
