#pragma once
#include <functional>
#include <map>
#include <string>
#include <vector>

struct Route {
    std::string path;
    std::string component;
    bool loginRequired;
};

struct Resolved {
    bool matched;
    std::string component;
    std::map<std::string, std::string> params;
    std::string query;
    std::string hash;
    bool popup;
    bool loginRequired;
};

class Router {
public:
    Router(std::vector<Route> routes, bool loggedIn, std::string notFound)
        : routes_(std::move(routes)), loggedIn_(loggedIn), notFound_(std::move(notFound)) {}

    void onChange(std::function<void(const Resolved&)> listener) { listeners_.push_back(std::move(listener)); }

    Resolved resolve(const std::string& fullPath) const {
        std::string path = fullPath, query, hash;
        if (auto h = path.find('#'); h != std::string::npos) { hash = path.substr(h + 1); path.erase(h); }
        if (auto q = path.find('?'); q != std::string::npos) { query = path.substr(q + 1); path.erase(q); }
        auto segments = segmentsOf(path);
        for (const auto& route : routes_) {
            auto pattern = segmentsOf(route.path);
            if (pattern.size() != segments.size()) continue;
            std::map<std::string, std::string> params;
            bool matches = true;
            for (size_t i = 0; i < pattern.size() && matches; ++i) {
                if (pattern[i][0] == ':') params[pattern[i].substr(1)] = segments[i];
                else matches = pattern[i] == segments[i];
            }
            if (matches) return {true, route.component, params, query, hash, false, route.loginRequired};
        }
        return {false, notFound_, {}, query, hash, false, false};
    }

    Resolved navigate(const std::string& fullPath) {
        Resolved res = resolve(fullPath);
        if (res.matched && res.loginRequired && !loggedIn_) {
            res.component = notFound_;
            res.popup = true;
        }
        if (res.matched) {
            for (const auto& listener : listeners_) listener(res);
        }
        return res;
    }

private:
    static std::vector<std::string> segmentsOf(const std::string& path) {
        std::vector<std::string> segments;
        size_t start = 0;
        while (start <= path.size()) {
            size_t end = path.find('/', start);
            if (end == std::string::npos) end = path.size();
            if (end > start) segments.push_back(path.substr(start, end - start));
            start = end + 1;
        }
        return segments;
    }

    std::vector<Route> routes_;
    bool loggedIn_;
    std::string notFound_;
    std::vector<std::function<void(const Resolved&)>> listeners_;
};
