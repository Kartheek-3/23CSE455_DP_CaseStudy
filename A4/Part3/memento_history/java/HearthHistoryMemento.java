package memento;

import java.util.*;

public class HearthHistoryMemento {
    public static class DashboardConfig {
        private final String title;
        private final String theme;
        private final List<String> widgets;

        public DashboardConfig(String title, String theme, List<String> widgets) {
            this.title = title;
            this.theme = theme;
            this.widgets = widgets != null ? new ArrayList<>(widgets) : new ArrayList<>();
        }

        public String getTitle() { return title; }
        public String getTheme() { return theme; }
        public List<String> getWidgets() { return Collections.unmodifiableList(widgets); }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof DashboardConfig)) return false;
            DashboardConfig that = (DashboardConfig) o;
            return Objects.equals(title, that.title) &&
                   Objects.equals(theme, that.theme) &&
                   Objects.equals(widgets, that.widgets);
        }

        @Override
        public int hashCode() {
            return Objects.hash(title, theme, widgets);
        }
    }

    public static class HistoryManager<T> {
        private final int capacity;
        private final Deque<T> undoStack = new ArrayDeque<>();
        private final Deque<T> redoStack = new ArrayDeque<>();
        private T transactionSnapshot = null;

        public HistoryManager(int capacity) {
            this.capacity = capacity > 0 ? capacity : 50;
        }

        public void push(T snapshot) {
            if (snapshot == null) return;
            if (undoStack.size() >= capacity) {
                // Remove oldest
                Deque<T> temp = new ArrayDeque<>();
                while (undoStack.size() > 1) {
                    temp.push(undoStack.pop());
                }
                undoStack.pop(); // discard oldest
                while (!temp.isEmpty()) {
                    undoStack.push(temp.pop());
                }
            }
            undoStack.push(snapshot);
            redoStack.clear();
        }

        public T undo(T current) {
            if (undoStack.isEmpty()) return current;
            redoStack.push(current);
            return undoStack.pop();
        }

        public T redo(T current) {
            if (redoStack.isEmpty()) return current;
            undoStack.push(current);
            return redoStack.pop();
        }

        public void enterEditMode(T current) {
            this.transactionSnapshot = current;
        }

        public T cancelEdit(T current) {
            if (transactionSnapshot != null) {
                T rollback = transactionSnapshot;
                transactionSnapshot = null;
                return rollback;
            }
            return current;
        }

        public void saveEdit() {
            this.transactionSnapshot = null;
        }

        public void clear() {
            undoStack.clear();
            redoStack.clear();
            transactionSnapshot = null;
        }

        public boolean canUndo() { return !undoStack.isEmpty(); }
        public boolean canRedo() { return !redoStack.isEmpty(); }
        public int getUndoCount() { return undoStack.size(); }
        public int getRedoCount() { return redoStack.size(); }
    }
}
