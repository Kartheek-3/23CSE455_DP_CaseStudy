# Part 3 Input Code Context: ha-fusion Pattern Origins

This document provides the source code context and architectural mappings from ha-fusion (SvelteKit smart home client) used to derive the representative problem snippets across the four target languages.

## 1. Composite: Visibility Condition Tree
- **ha-fusion Source**: `src/lib/Conditional/` (`Condition.svelte`, `conditions.ts`)
- **Context**: Dashboard UI elements evaluate conditional visibility using boolean expression trees containing unary NOT, binary/n-ary AND/OR composites, and leaf nodes (StateCondition, NumericStateCondition).

## 2. Observer: Entity Subscription Observer
- **ha-fusion Source**: `src/lib/Stores/` (`states.ts`, WebSocket subscription bridge)
- **Context**: Central Home Assistant WebSocket hub manages live entity state updates. Multiple client components (dashboard widgets, loggers, notification badges) subscribe to entity changes and receive notifications upon state mutations.

## 3. Memento: Hearth History & Transaction Memento
- **ha-fusion Source**: `src/lib/Hearth/` (`history.ts`, `editor.ts`)
- **Context**: Hearth dashboard layout editor supports bounded multi-level undo/redo operations and staging/transaction rollbacks. State snapshots are encapsulated without exposing internal structure.

## 4. Strategy: Visibility Condition Evaluator Dispatch
- **ha-fusion Source**: `src/lib/Conditional/evaluator.ts`
- **Context**: Dynamic condition evaluation uses interchangeable evaluator strategies (state matching, numeric threshold comparisons, screen width media breakpoints, custom runtime predicates) dispatched dynamically based on condition type.

## 5. Factory Method: Entity Domain Modal Factory
- **ha-fusion Source**: `src/lib/Modals/` (`Modal.svelte`, `domainFactory.ts`)
- **Context**: Clicking an entity tile opens domain-specific controls (LightModal, SwitchModal, SensorModal, ClimateModal, GenericModal) instantiated through a parameterized factory method decoupling caller from concrete modal views.

## 6. Template Method: Konva Canvas Renderer Base
- **ha-fusion Source**: `src/lib/PictureElements/` (`Canvas.svelte`, `viewer.ts`, `editor.ts`)
- **Context**: Picture Elements floorplan rendering defines an invariant template method workflow (`renderCanvas`: scale calculation -> background layer -> element rendering -> overlay layer -> post-render hook) where Viewer and Editor subclasses customize specific rendering steps.
