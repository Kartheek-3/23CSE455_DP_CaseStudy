from typing import Any, Generic, List, Optional, TypeVar

T = TypeVar("T")


class DashboardConfig:
    def __init__(self, title: str, theme: str, widgets: Optional[List[str]] = None):
        self.title = title
        self.theme = theme
        self.widgets = list(widgets) if widgets else []

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, DashboardConfig):
            return False
        return (
            self.title == other.title
            and self.theme == other.theme
            and self.widgets == other.widgets
        )


class HistoryManager(Generic[T]):
    def __init__(self, capacity: int = 50):
        self.capacity = capacity if capacity > 0 else 50
        self.undo_stack: List[T] = []
        self.redo_stack: List[T] = []
        self.transaction_snapshot: Optional[T] = None

    def push(self, snapshot: T) -> None:
        if snapshot is None:
            return
        if len(self.undo_stack) >= self.capacity:
            self.undo_stack.pop(0)  # Evict oldest entry
        self.undo_stack.append(snapshot)
        self.redo_stack.clear()

    def undo(self, current: T) -> T:
        if not self.undo_stack:
            return current
        self.redo_stack.append(current)
        return self.undo_stack.pop()

    def redo(self, current: T) -> T:
        if not self.redo_stack:
            return current
        self.undo_stack.append(current)
        return self.redo_stack.pop()

    def enter_edit_mode(self, current: T) -> None:
        self.transaction_snapshot = current

    def cancel_edit(self, current: T) -> T:
        if self.transaction_snapshot is not None:
            rollback = self.transaction_snapshot
            self.transaction_snapshot = None
            return rollback
        return current

    def save_edit(self) -> None:
        self.transaction_snapshot = None

    def clear(self) -> None:
        self.undo_stack.clear()
        self.redo_stack.clear()
        self.transaction_snapshot = None

    @property
    def can_undo(self) -> bool:
        return len(self.undo_stack) > 0

    @property
    def can_redo(self) -> bool:
        return len(self.redo_stack) > 0

    @property
    def undo_count(self) -> int:
        return len(self.undo_stack)

    @property
    def redo_count(self) -> int:
        return len(self.redo_stack)
