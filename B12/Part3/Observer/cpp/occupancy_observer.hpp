#pragma once

#include <algorithm>
#include <cstddef>
#include <set>
#include <string>
#include <vector>

// Observer pattern (GoF, behavioural) -- real-time occupancy notifications.
// Production snippet (header). Tests live in observer_test.cpp.

class OccupancyObserver {
public:
    virtual ~OccupancyObserver() = default;
    virtual void update(const std::string& event) = 0;
};

class AvailabilityObserver : public OccupancyObserver {
public:
    void update(const std::string& event) override {
        std::size_t sep = event.find(':');
        std::string kind = event.substr(0, sep);
        int id = std::stoi(event.substr(sep + 1));
        if (kind == "occupy") {
            occupied_.insert(id);
        } else if (kind == "free") {
            occupied_.erase(id);
        }
    }
    std::size_t count() const { return occupied_.size(); }

private:
    std::set<int> occupied_;
};

class LoggingObserver : public OccupancyObserver {
public:
    void update(const std::string& event) override { events_.push_back(event); }
    const std::vector<std::string>& events() const { return events_; }

private:
    std::vector<std::string> events_;
};

class OccupancyMonitor {
public:
    void attach(OccupancyObserver* observer) { observers_.push_back(observer); }
    void detach(OccupancyObserver* observer) {
        observers_.erase(std::remove(observers_.begin(), observers_.end(), observer),
                         observers_.end());
    }
    std::size_t notify(const std::string& event) {
        for (auto* observer : observers_) {
            observer->update(event);
        }
        return observers_.size();
    }

private:
    std::vector<OccupancyObserver*> observers_;
};
