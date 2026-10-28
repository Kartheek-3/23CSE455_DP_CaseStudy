#include "konva_canvas_template.hpp"
#include <iostream>
#include <iomanip>
#include <windows.h>
#include <cmath>

int main() {
    LARGE_INTEGER freq, t1, t2;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&t1);

    std::vector<std::string> elements = {
        "light.living_room",
        "sensor.kitchen_temp",
        "camera.entryway"
    };

    KonvaViewer viewer;
    KonvaEditor editor;

    viewer.renderCanvas(1000, 750, 1.2, 2.0, "floorplan_ground.png", elements);
    editor.renderCanvas(1000, 750, 1.2, 2.0, "floorplan_ground.png", elements);

    int passed = 0;
    int total = 5;

    // Check 1: Invariant scale calculation (1.2 * 2.0 = 2.4)
    if (std::abs(viewer.getEffectiveScale() - 2.4) < 1e-9 &&
        std::abs(editor.getEffectiveScale() - 2.4) < 1e-9) passed++;

    // Check 2: Invariant rendered elements count (3 elements)
    if (viewer.getRenderedElements().size() == 3 &&
        editor.getRenderedElements().size() == 3) passed++;

    // Check 3: Viewer overlay type
    if (viewer.getOverlayType() == "PASSIVE_TOOLTIPS") passed++;

    // Check 4: Editor overlay type
    if (editor.getOverlayType() == "INTERACTIVE_TRANSFORM_HANDLES") passed++;

    // Check 5: Hook execution (Viewer false, Editor true)
    if (!viewer.isSnapshotRecorded() && editor.isSnapshotRecorded()) passed++;

    QueryPerformanceCounter(&t2);
    double elapsedMs = (t2.QuadPart - t1.QuadPart) * 1000.0 / freq.QuadPart;

    std::cout << "RESULT: " << passed << "/" << total << " passed\n";
    std::cout << "TIME_MS: " << std::fixed << std::setprecision(4) << elapsedMs << "\n";

    if (passed != total) return 1;
    return 0;
}
