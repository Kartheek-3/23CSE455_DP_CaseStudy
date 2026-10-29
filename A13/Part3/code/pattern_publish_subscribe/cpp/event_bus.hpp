#pragma once
#include <algorithm>
#include <functional>
#include <map>
#include <string>
#include <utility>
#include <vector>

// Stands in for Redis plus the per-connection channel emitters.
class Broker {
public:
    using Handler = std::function<void(const std::string& channel, const std::string& message)>;

    // std::function cannot be compared, so subscribe() returns a token for unsubscribe().
    int subscribe(const std::string& channel, Handler handler) {
        subscribers_[channel].emplace_back(++lastToken_, std::move(handler));
        return lastToken_;
    }

    void unsubscribe(const std::string& channel, int token) {
        auto& handlers = subscribers_[channel];
        handlers.erase(std::remove_if(handlers.begin(), handlers.end(),
                                      [token](const auto& h) { return h.first == token; }),
                       handlers.end());
    }

    int publish(const std::string& channel, const std::string& message) {
        auto handlers = subscribers_[channel];
        for (const auto& [token, handler] : handlers) handler(channel, message);
        return static_cast<int>(handlers.size());
    }

private:
    int lastToken_ = 0;
    std::map<std::string, std::vector<std::pair<int, Handler>>> subscribers_;
};

class GlobalEventService {
public:
    explicit GlobalEventService(Broker& broker) : broker_(broker) {}

    int publishMainStream(const std::string& userId, const std::string& type, const std::string& body) {
        return publish("mainStream:" + userId, type, body);
    }

    int publishBroadcastStream(const std::string& type, const std::string& body) {
        return publish("broadcast", type, body);
    }

private:
    int publish(const std::string& channel, const std::string& type, const std::string& body) {
        return broker_.publish(channel, "{\"type\":\"" + type + "\",\"body\":\"" + body + "\"}");
    }

    Broker& broker_;
};
