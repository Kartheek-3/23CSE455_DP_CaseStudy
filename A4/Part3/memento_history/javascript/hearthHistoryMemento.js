export class DashboardConfig {
  constructor(title, theme, widgets = []) {
    this.title = title;
    this.theme = theme;
    this.widgets = [...widgets];
  }

  equals(other) {
    if (!other || !(other instanceof DashboardConfig)) return false;
    if (this.title !== other.title || this.theme !== other.theme) return false;
    if (this.widgets.length !== other.widgets.length) return false;
    return this.widgets.every((w, i) => w === other.widgets[i]);
  }
}

export class HistoryManager {
  constructor(capacity = 50) {
    this.capacity = capacity > 0 ? capacity : 50;
    this.undoStack = [];
    this.redoStack = [];
    this.transactionSnapshot = null;
  }

  push(snapshot) {
    if (snapshot === null || snapshot === undefined) return;
    if (this.undoStack.length >= this.capacity) {
      this.undoStack.shift(); // Evict oldest
    }
    this.undoStack.push(snapshot);
    this.redoStack = [];
  }

  undo(current) {
    if (this.undoStack.length === 0) return current;
    this.redoStack.push(current);
    return this.undoStack.pop();
  }

  redo(current) {
    if (this.redoStack.length === 0) return current;
    this.undoStack.push(current);
    return this.redoStack.pop();
  }

  enterEditMode(current) {
    this.transactionSnapshot = current;
  }

  cancelEdit(current) {
    if (this.transactionSnapshot !== null) {
      const rollback = this.transactionSnapshot;
      this.transactionSnapshot = null;
      return rollback;
    }
    return current;
  }

  saveEdit() {
    this.transactionSnapshot = null;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.transactionSnapshot = null;
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  get undoCount() {
    return this.undoStack.length;
  }

  get redoCount() {
    return this.redoStack.length;
  }
}
