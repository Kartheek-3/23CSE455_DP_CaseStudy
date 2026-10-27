#ifndef B14_OBSERVER_HPP
#define B14_OBSERVER_HPP
#include <algorithm>
#include <string>
#include <vector>

class AuthListener {
public:
    virtual ~AuthListener() = default;
    virtual void onAuthStateChanged(const std::string& event, const std::string& session) = 0;
};
class AuthEventSource {
    std::vector<AuthListener*> listeners;
public:
    void subscribe(AuthListener* listener) { listeners.push_back(listener); }
    void unsubscribe(AuthListener* listener) {
        listeners.erase(std::remove(listeners.begin(), listeners.end(), listener), listeners.end());
    }
    void publish(const std::string& event, const std::string& session) {
        const auto snapshot = listeners;
        for (auto* listener : snapshot) listener->onAuthStateChanged(event, session);
    }
};
class RecordingAuthListener final : public AuthListener {
    std::string name;
    std::vector<std::string> receivedEvents;
public:
    explicit RecordingAuthListener(std::string listenerName) : name(std::move(listenerName)) {}
    void onAuthStateChanged(const std::string& event, const std::string& session) override {
        receivedEvents.push_back(name + " receives " + event + ":" + session);
    }
    const std::vector<std::string>& received() const { return receivedEvents; }
};
#endif
