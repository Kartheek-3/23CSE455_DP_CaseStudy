# Template Method Pattern — JavaScript (Node.js) Implementation

## Pattern Problem
Implements the **Picture Elements Canvas Lifecycle** from `ha-fusion` (`src/lib/Modal/PictureElements/konvaBase.ts`, `konvaViewer.ts`, and `konvaEditor.ts`), where an abstract canvas base defines an invariant pipeline (`initializeStage` -> `calculateViewportScale` -> `renderBackground` -> `renderElements` -> `renderOverlay` -> `onRenderCompleteHook`), customized by viewer and editor subclasses.

## File Manifest
- `konvaCanvasTemplate.js`: Production snippet defining `KonvaCanvasTemplate` base class with template method `renderCanvas`, and concrete subclasses (`KonvaViewer`, `KonvaEditor`).
- `testRunner.js`: Test harness evaluating invariant execution and subclass specialization.

## How to Run
From the root of `A4/`:
```bash
node Part3/template_canvas_renderer/javascript/testRunner.js
```

## Timing Protocol
Measured using Node.js `perf_hooks.performance.now()` in milliseconds across 1 warm-up run and 5 measured runs.
