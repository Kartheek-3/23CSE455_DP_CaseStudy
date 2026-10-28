#pragma once
#include <algorithm>
#include <functional>
#include <map>
#include <string>
#include <utility>
#include <vector>

struct CommitEvent {
    std::string key;
    std::string value;
    std::string oldValue;
};

class PreferencesManager {
public:
    using Listener = std::function<void(const CommitEvent&)>;

    // std::function cannot be compared, so on() hands back a handle for off().
    int on(Listener listener) {
        listeners_.emplace_back(++lastHandle_, std::move(listener));
        return lastHandle_;
    }

    void off(int handle) {
        listeners_.erase(std::remove_if(listeners_.begin(), listeners_.end(),
                                        [handle](const auto& l) { return l.first == handle; }),
                         listeners_.end());
    }

    void commit(const std::string& key, const std::string& value) {
        if (auto it = state_.find(key); it != state_.end() && it->second == value) return;  // unchanged: not announced
        state_[key] = value;
        // As in manager.ts:261-271, oldValue is read after the state was updated, so it equals value.
        CommitEvent event{key, value, state_[key]};
        auto snapshot = listeners_;
        for (const auto& [handle, listener] : snapshot) listener(event);
    }

private:
    int lastHandle_ = 0;
    std::map<std::string, std::string> state_;
    std::vector<std::pair<int, Listener>> listeners_;
};
