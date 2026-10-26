# Template Method Pattern — Python Implementation

## Pattern Problem
Implements the **Picture Elements Canvas Lifecycle** from `ha-fusion` (`src/lib/Modal/PictureElements/konvaBase.ts`, `konvaViewer.ts`, and `konvaEditor.ts`), where an abstract canvas base defines an invariant pipeline (`initialize_stage` -> `calculate_viewport_scale` -> `render_background` -> `render_elements` -> `render_overlay` -> `on_render_complete_hook`), customized by viewer and editor subclasses.

## File Manifest
- `konva_canvas_template.py`: Production snippet defining `KonvaCanvasTemplate` abstract base with template method `render_canvas`, and concrete subclasses (`KonvaViewer`, `KonvaEditor`).
- `test_runner.py`: Test harness evaluating invariant execution and subclass specialization.

## How to Run
From the root of `A4/`:
```bash
python Part3/template_canvas_renderer/python/test_runner.py
```

## Timing Protocol
Measured using `time.perf_counter()` in milliseconds across 1 warm-up run and 5 measured runs.
