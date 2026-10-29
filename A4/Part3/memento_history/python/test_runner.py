import sys
import time
from hearth_history_memento import DashboardConfig, HistoryManager


def run_tests():
    start = time.perf_counter()

    manager = HistoryManager[DashboardConfig](capacity=3)

    s0 = DashboardConfig("Home", "dark", ["clock", "weather"])
    s1 = DashboardConfig("Living Room", "dark", ["clock", "weather", "light"])
    s2 = DashboardConfig("Master Suite", "light", ["clock", "light"])

    passed = 0
    total = 6

    current = s0
    manager.push(current)
    current = s1
    manager.push(current)
    current = s2

    # Check 1: can_undo is true, can_redo is false
    if manager.can_undo and not manager.can_redo:
        passed += 1

    # Check 2: Undo restores to s1
    current = manager.undo(current)
    if current == s1:
        passed += 1

    # Check 3: Redo restores to s2
    current = manager.redo(current)
    if current == s2:
        passed += 1

    # Check 4: Transaction edit mode & cancel rollback
    manager.enter_edit_mode(current)
    corrupted = DashboardConfig("Corrupted", "neon", [])
    current = corrupted
    current = manager.cancel_edit(current)
    if current == s2:
        passed += 1

    # Check 5: Bounded capacity enforcement (capacity=3)
    manager.push(s1)
    manager.push(s2)
    manager.push(s0)
    manager.push(s1)
    if manager.undo_count == 3:
        passed += 1

    # Check 6: Clear operation
    manager.clear()
    if not manager.can_undo and not manager.can_redo and manager.undo_count == 0:
        passed += 1

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    print(f"RESULT: {passed}/{total} passed")
    print(f"TIME_MS: {elapsed_ms:.3f}")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
