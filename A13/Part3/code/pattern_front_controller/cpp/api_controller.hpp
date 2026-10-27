#pragma once
#include <functional>
#include <map>
#include <optional>
#include <string>

struct Endpoint {
    std::string name;
    bool requireCredential;
    std::function<std::string(const std::string& body, const std::optional<std::string>& user)> execute;
};

struct Response {
    int status;
    std::string text;
};

class ApiController {
public:
    using Authenticator = std::function<std::optional<std::string>(const std::string& token)>;

    ApiController(Authenticator authenticate, int limit = 2) : authenticate_(std::move(authenticate)), limit_(limit) {}

    void registerEndpoint(const Endpoint& endpoint) { endpoints_[endpoint.name] = endpoint; }

    Response handle(const std::string& name, const std::string& token, const std::string& body) {
        auto it = endpoints_.find(name);
        if (it == endpoints_.end()) return {404, "no such endpoint"};
        auto user = authenticate_(token);
        if (it->second.requireCredential && !user) return {401, "credential required"};
        std::string actor = user.value_or("anon");
        int& count = calls_[actor];
        if (count >= limit_) return {429, "rate limited"};
        ++count;
        return {200, it->second.execute(body, user)};
    }

private:
    Authenticator authenticate_;
    int limit_;
    std::map<std::string, Endpoint> endpoints_;
    std::map<std::string, int> calls_;
};
