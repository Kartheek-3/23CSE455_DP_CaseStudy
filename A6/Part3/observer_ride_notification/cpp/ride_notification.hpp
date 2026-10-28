// Observer pattern: ride event notification (mirrors SocketNotificationService + Redis socket registry).
#pragma once
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

struct Event {
    std::string type;
    std::string bookingId;
};

class Observer {
public:
    virtual ~Observer() = default;
    virtual void update(const Event& event) = 0;
};

// Stands in for a connected rider/driver socket.
class RecordingObserver : public Observer {
public:
    void update(const Event& event) override { received.push_back(event); }
    std::vector<Event> received;
};

// Subject: one observer per subscriber id; a reconnect replaces the old one.
// Holds weak references so a disconnected observer that was destroyed is skipped.
class NotificationHub {
public:
    void subscribe(const std::string& id, const std::shared_ptr<Observer>& observer) { subscribers_[id] = observer; }

    void unsubscribe(const std::string& id) { subscribers_.erase(id); }

    bool notify(const std::string& id, const Event& event) {
        auto it = subscribers_.find(id);
        if (it == subscribers_.end()) return false;
        auto observer = it->second.lock();
        if (!observer) return false;
        observer->update(event);
        return true;
    }

    int broadcast(const std::vector<std::string>& ids, const Event& event) {
        int delivered = 0;
        for (const auto& id : ids) {
            if (notify(id, event)) ++delivered;
        }
        return delivered;
    }

private:
    std::unordered_map<std::string, std::weak_ptr<Observer>> subscribers_;
};
