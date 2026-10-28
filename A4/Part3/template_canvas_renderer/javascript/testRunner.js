import { performance } from 'perf_hooks';
import { KonvaViewer, KonvaEditor } from './konvaCanvasTemplate.js';

function runTests() {
  const start = performance.now();

  const elements = ['light.living_room', 'sensor.kitchen_temp', 'camera.entryway'];

  const viewer = new KonvaViewer();
  const editor = new KonvaEditor();

  viewer.renderCanvas(1000, 750, 1.2, 2.0, 'floorplan_ground.png', elements);
  editor.renderCanvas(1000, 750, 1.2, 2.0, 'floorplan_ground.png', elements);

  let passed = 0;
  const total = 5;

  // Check 1: Invariant scale calculation (1.2 * 2.0 = 2.4)
  if (
    Math.abs(viewer.effectiveScale - 2.4) < 1e-9 &&
    Math.abs(editor.effectiveScale - 2.4) < 1e-9
  ) {
    passed++;
  }

  // Check 2: Invariant rendered elements count (3 elements)
  if (viewer.renderedElements.length === 3 && editor.renderedElements.length === 3) {
    passed++;
  }

  // Check 3: Viewer overlay type
  if (viewer.overlayType === 'PASSIVE_TOOLTIPS') {
    passed++;
  }

  // Check 4: Editor overlay type
  if (editor.overlayType === 'INTERACTIVE_TRANSFORM_HANDLES') {
    passed++;
  }

  // Check 5: Hook execution (Viewer false, Editor true)
  if (!viewer.snapshotRecorded && editor.snapshotRecorded) {
    passed++;
  }

  const elapsedMs = performance.now() - start;

  console.log(`RESULT: ${passed}/${total} passed`);
  console.log(`TIME_MS: ${elapsedMs.toFixed(3)}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
