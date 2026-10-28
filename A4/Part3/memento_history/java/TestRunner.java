package memento;

import java.util.Arrays;

public class TestRunner {
    public static void main(String[] args) {
        long start = System.nanoTime();

        HearthHistoryMemento.HistoryManager<HearthHistoryMemento.DashboardConfig> manager =
            new HearthHistoryMemento.HistoryManager<>(3);

        HearthHistoryMemento.DashboardConfig s0 =
            new HearthHistoryMemento.DashboardConfig("Home", "dark", Arrays.asList("clock", "weather"));
        HearthHistoryMemento.DashboardConfig s1 =
            new HearthHistoryMemento.DashboardConfig("Living Room", "dark", Arrays.asList("clock", "weather", "light"));
        HearthHistoryMemento.DashboardConfig s2 =
            new HearthHistoryMemento.DashboardConfig("Master Suite", "light", Arrays.asList("clock", "light"));

        int passed = 0;
        int total = 6;

        HearthHistoryMemento.DashboardConfig current = s0;
        manager.push(current);
        current = s1;
        manager.push(current);
        current = s2;

        // Check 1: canUndo is true, canRedo is false
        if (manager.canUndo() && !manager.canRedo()) passed++;

        // Check 2: Undo restores to s1
        current = manager.undo(current);
        if (s1.equals(current)) passed++;

        // Check 3: Redo restores to s2
        current = manager.redo(current);
        if (s2.equals(current)) passed++;

        // Check 4: Transaction edit mode & cancel rollback
        manager.enterEditMode(current);
        HearthHistoryMemento.DashboardConfig corrupted =
            new HearthHistoryMemento.DashboardConfig("Corrupted", "neon", Arrays.asList());
        current = corrupted;
        current = manager.cancelEdit(current);
        if (s2.equals(current)) passed++;

        // Check 5: Bounded capacity enforcement (capacity=3)
        manager.push(s1);
        manager.push(s2);
        manager.push(s0);
        manager.push(s1);
        // stack bounded at 3 entries
        if (manager.getUndoCount() == 3) passed++;

        // Check 6: Clear operation
        manager.clear();
        if (!manager.canUndo() && !manager.canRedo() && manager.getUndoCount() == 0) passed++;

        long elapsedNanos = System.nanoTime() - start;
        double elapsedMs = elapsedNanos / 1_000_000.0;

        System.out.printf("RESULT: %d/%d passed\n", passed, total);
        System.out.printf("TIME_MS: %.3f\n", elapsedMs);

        if (passed != total) {
            System.exit(1);
        }
    }
}
