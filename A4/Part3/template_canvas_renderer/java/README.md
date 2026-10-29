# Template Method Pattern — Java Implementation

## Pattern Problem
Implements the **Picture Elements Canvas Lifecycle** from `ha-fusion` (`src/lib/Modal/PictureElements/konvaBase.ts`, `konvaViewer.ts`, and `konvaEditor.ts`), where an abstract canvas base defines an invariant pipeline (`initializeStage` -> `calculateViewportScale` -> `renderBackground` -> `renderElements` -> `renderOverlay` -> `onRenderCompleteHook`), customized by viewer and editor subclasses.

## File Manifest
- `KonvaCanvasTemplate.java`: Production snippet defining `KonvaCanvasTemplate` abstract base with template method `renderCanvas`, and concrete subclasses (`KonvaViewer`, `KonvaEditor`).
- `TestRunner.java`: Test harness evaluating invariant execution and subclass specialization.

## How to Compile & Run
From the root of `A4/`:
```bash
javac -d Part3/template_canvas_renderer/java/bin Part3/template_canvas_renderer/java/KonvaCanvasTemplate.java Part3/template_canvas_renderer/java/TestRunner.java
java -cp Part3/template_canvas_renderer/java/bin templatemethod.TestRunner
```

## Timing Protocol
Measured using `System.nanoTime()` in milliseconds across 1 warm-up run and 5 measured runs.
