#pragma once
#include <algorithm>
#include <functional>
#include <set>
#include <string>
#include <vector>

class PluginHost {
public:
    using Handler = std::function<std::string(const std::string&)>;
    using Registrar = std::function<void(const std::string& type, Handler fn)>;

    void install(const std::string& pluginId, const std::function<void(const Registrar&)>& setup) {
        contexts_.insert(pluginId);
        // an exception from setup propagates; handlers added so far stay registered
        setup([this, pluginId](const std::string& type, Handler fn) {
            handlers_.push_back({pluginId, type, std::move(fn)});
        });
    }

    void abort(const std::string& pluginId) {
        if (contexts_.erase(pluginId) == 0) return;
        handlers_.erase(std::remove_if(handlers_.begin(), handlers_.end(),
                                       [&](const Entry& e) { return e.pluginId == pluginId; }),
                        handlers_.end());
    }

    std::vector<Handler> getHandlers(const std::string& type) const {
        std::vector<Handler> result;
        for (const auto& e : handlers_) if (e.type == type) result.push_back(e.fn);
        return result;
    }

private:
    struct Entry {
        std::string pluginId;
        std::string type;
        Handler fn;
    };

    std::set<std::string> contexts_;
    std::vector<Entry> handlers_;
};
