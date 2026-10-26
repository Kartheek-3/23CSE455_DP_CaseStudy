#ifndef HEARTH_HISTORY_MEMENTO_HPP
#define HEARTH_HISTORY_MEMENTO_HPP

#include <string>
#include <vector>
#include <deque>

class DashboardConfig {
private:
    std::string title;
    std::string theme;
    std::vector<std::string> widgets;
public:
    DashboardConfig() = default;
    DashboardConfig(std::string title, std::string theme, std::vector<std::string> widgets);

    const std::string& getTitle() const;
    const std::string& getTheme() const;
    const std::vector<std::string>& getWidgets() const;

    bool operator==(const DashboardConfig& other) const;
    bool operator!=(const DashboardConfig& other) const;
};

template <typename T>
class HistoryManager {
private:
    size_t capacity;
    std::deque<T> undoStack;
    std::deque<T> redoStack;
    bool hasTransaction;
    T transactionSnapshot;
public:
    explicit HistoryManager(size_t capacity = 50)
        : capacity(capacity > 0 ? capacity : 50), hasTransaction(false) {}

    void push(const T& snapshot) {
        if (undoStack.size() >= capacity) {
            undoStack.pop_front(); // Evict oldest entry
        }
        undoStack.push_back(snapshot);
        redoStack.clear();
    }

    T undo(const T& current) {
        if (undoStack.empty()) return current;
        redoStack.push_back(current);
        T top = undoStack.back();
        undoStack.pop_back();
        return top;
    }

    T redo(const T& current) {
        if (redoStack.empty()) return current;
        undoStack.push_back(current);
        T top = redoStack.back();
        redoStack.pop_back();
        return top;
    }

    void enterEditMode(const T& current) {
        transactionSnapshot = current;
        hasTransaction = true;
    }

    T cancelEdit(const T& current) {
        if (hasTransaction) {
            hasTransaction = false;
            return transactionSnapshot;
        }
        return current;
    }

    void saveEdit() {
        hasTransaction = false;
    }

    void clear() {
        undoStack.clear();
        redoStack.clear();
        hasTransaction = false;
    }

    bool canUndo() const { return !undoStack.empty(); }
    bool canRedo() const { return !redoStack.empty(); }
    size_t getUndoCount() const { return undoStack.size(); }
    size_t getRedoCount() const { return redoStack.size(); }
};

#endif // HEARTH_HISTORY_MEMENTO_HPP
