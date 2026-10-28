# Template Method Pattern — C++ Implementation

## Pattern Problem
Implements the **Picture Elements Canvas Lifecycle** from `ha-fusion` (`src/lib/Modal/PictureElements/konvaBase.ts`, `konvaViewer.ts`, and `konvaEditor.ts`), where an abstract canvas base defines an invariant pipeline (`initializeStage` -> `calculateViewportScale` -> `renderBackground` -> `renderElements` -> `renderOverlay` -> `onRenderCompleteHook`), customized by viewer and editor subclasses.

## File Manifest
- `konva_canvas_template.hpp` & `konva_canvas_template.cpp`: Production snippet defining `KonvaCanvasTemplate` abstract base with template method `renderCanvas`, and concrete subclasses (`KonvaViewer`, `KonvaEditor`).
- `test_runner.cpp`: Test harness evaluating invariant execution and subclass specialization.

## How to Compile & Run
From the root of `A4/`:
```bash
g++ -O2 -std=c++14 -I Part3/template_canvas_renderer/cpp Part3/template_canvas_renderer/cpp/konva_canvas_template.cpp Part3/template_canvas_renderer/cpp/test_runner.cpp -o Part3/template_canvas_renderer/cpp/test_runner.exe
Part3/template_canvas_renderer/cpp/test_runner.exe
```

## Timing Protocol
Measured using `std::chrono::high_resolution_clock` inside `test_runner.cpp` in milliseconds across 1 warm-up run and 5 measured runs.
