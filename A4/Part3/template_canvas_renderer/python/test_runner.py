import sys
import time
from konva_canvas_template import KonvaViewer, KonvaEditor


def run_tests():
    start = time.perf_counter()

    elements = ["light.living_room", "sensor.kitchen_temp", "camera.entryway"]

    viewer = KonvaViewer()
    editor = KonvaEditor()

    viewer.render_canvas(1000, 750, 1.2, 2.0, "floorplan_ground.png", elements)
    editor.render_canvas(1000, 750, 1.2, 2.0, "floorplan_ground.png", elements)

    passed = 0
    total = 5

    # Check 1: Invariant scale calculation (1.2 * 2.0 = 2.4)
    if (
        abs(viewer.effective_scale - 2.4) < 1e-9
        and abs(editor.effective_scale - 2.4) < 1e-9
    ):
        passed += 1

    # Check 2: Invariant rendered elements count (3 elements)
    if len(viewer.rendered_elements) == 3 and len(editor.rendered_elements) == 3:
        passed += 1

    # Check 3: Viewer overlay type
    if viewer.overlay_type == "PASSIVE_TOOLTIPS":
        passed += 1

    # Check 4: Editor overlay type
    if editor.overlay_type == "INTERACTIVE_TRANSFORM_HANDLES":
        passed += 1

    # Check 5: Hook execution (Viewer false, Editor true)
    if not viewer.snapshot_recorded and editor.snapshot_recorded:
        passed += 1

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    print(f"RESULT: {passed}/{total} passed")
    print(f"TIME_MS: {elapsed_ms:.3f}")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
