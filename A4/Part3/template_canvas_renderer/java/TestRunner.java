package templatemethod;

import java.util.Arrays;
import java.util.List;

public class TestRunner {
    public static void main(String[] args) {
        long start = System.nanoTime();

        List<String> elements = Arrays.asList("light.living_room", "sensor.kitchen_temp", "camera.entryway");

        KonvaCanvasTemplate.KonvaViewer viewer = new KonvaCanvasTemplate.KonvaViewer();
        KonvaCanvasTemplate.KonvaEditor editor = new KonvaCanvasTemplate.KonvaEditor();

        viewer.renderCanvas(1000, 750, 1.2, 2.0, "floorplan_ground.png", elements);
        editor.renderCanvas(1000, 750, 1.2, 2.0, "floorplan_ground.png", elements);

        int passed = 0;
        int total = 5;

        // Check 1: Invariant scale calculation (1.2 * 2.0 = 2.4)
        if (Math.abs(viewer.getEffectiveScale() - 2.4) < 1e-9 &&
            Math.abs(editor.getEffectiveScale() - 2.4) < 1e-9) passed++;

        // Check 2: Invariant rendered elements count (3 elements)
        if (viewer.getRenderedElements().size() == 3 &&
            editor.getRenderedElements().size() == 3) passed++;

        // Check 3: Viewer overlay type
        if ("PASSIVE_TOOLTIPS".equals(viewer.getOverlayType())) passed++;

        // Check 4: Editor overlay type
        if ("INTERACTIVE_TRANSFORM_HANDLES".equals(editor.getOverlayType())) passed++;

        // Check 5: Hook execution (Viewer false, Editor true)
        if (!viewer.isSnapshotRecorded() && editor.isSnapshotRecorded()) passed++;

        long elapsedNanos = System.nanoTime() - start;
        double elapsedMs = elapsedNanos / 1_000_000.0;

        System.out.printf("RESULT: %d/%d passed\n", passed, total);
        System.out.printf("TIME_MS: %.3f\n", elapsedMs);

        if (passed != total) {
            System.exit(1);
        }
    }
}
