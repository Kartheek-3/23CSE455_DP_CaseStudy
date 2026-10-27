#include "hearth_history_memento.hpp"
#include <iostream>
#include <iomanip>
#include <windows.h>

int main() {
    LARGE_INTEGER freq, t1, t2;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&t1);

    HistoryManager<DashboardConfig> manager(3);

    DashboardConfig s0("Home", "dark", {"clock", "weather"});
    DashboardConfig s1("Living Room", "dark", {"clock", "weather", "light"});
    DashboardConfig s2("Master Suite", "light", {"clock", "light"});

    int passed = 0;
    int total = 6;

    DashboardConfig current = s0;
    manager.push(current);
    current = s1;
    manager.push(current);
    current = s2;

    // Check 1: canUndo is true, canRedo is false
    if (manager.canUndo() && !manager.canRedo()) passed++;

    // Check 2: Undo restores to s1
    current = manager.undo(current);
    if (current == s1) passed++;

    // Check 3: Redo restores to s2
    current = manager.redo(current);
    if (current == s2) passed++;

    // Check 4: Transaction edit mode & cancel rollback
    manager.enterEditMode(current);
    DashboardConfig corrupted("Corrupted", "neon", {});
    current = corrupted;
    current = manager.cancelEdit(current);
    if (current == s2) passed++;

    // Check 5: Bounded capacity enforcement (capacity=3)
    manager.push(s1);
    manager.push(s2);
    manager.push(s0);
    manager.push(s1);
    if (manager.getUndoCount() == 3) passed++;

    // Check 6: Clear operation
    manager.clear();
    if (!manager.canUndo() && !manager.canRedo() && manager.getUndoCount() == 0) passed++;

    QueryPerformanceCounter(&t2);
    double elapsedMs = (t2.QuadPart - t1.QuadPart) * 1000.0 / freq.QuadPart;

    std::cout << "RESULT: " << passed << "/" << total << " passed\n";
    std::cout << "TIME_MS: " << std::fixed << std::setprecision(4) << elapsedMs << "\n";

    if (passed != total) return 1;
    return 0;
}
