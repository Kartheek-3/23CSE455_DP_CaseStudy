#pragma once
#include <algorithm>
#include <cctype>
#include <map>
#include <optional>
#include <string>

struct Instance {
    std::string host;
    int id;
};

class InMemoryInstanceRepository {
public:
    int finds = 0;    // counters let the tests see whether the database was used
    int inserts = 0;

    std::optional<Instance> findOneByHost(const std::string& host) {
        ++finds;
        auto it = rows_.find(host);
        if (it == rows_.end()) return std::nullopt;
        return it->second;
    }

    Instance insertOne(const std::string& host) {
        ++inserts;
        Instance row{host, static_cast<int>(rows_.size()) + 1};
        rows_[host] = row;
        return row;
    }

private:
    std::map<std::string, Instance> rows_;
};

class KeyValueCache {
public:
    bool has(const std::string& key) const { return items_.count(key) > 0; }
    std::optional<Instance> get(const std::string& key) const {
        auto it = items_.find(key);
        return it == items_.end() ? std::nullopt : it->second;
    }
    void set(const std::string& key, const std::optional<Instance>& value) { items_[key] = value; }
    void dispose() { items_.clear(); }

private:
    std::map<std::string, std::optional<Instance>> items_;
};

class FederatedInstanceService {
public:
    FederatedInstanceService(InMemoryInstanceRepository& repository, KeyValueCache& cache)
        : repository_(repository), cache_(cache) {}

    Instance fetchOrRegister(std::string host) {
        host = lower(host);
        if (auto cached = cache_.get(host)) return *cached;
        auto found = repository_.findOneByHost(host);
        Instance instance = found ? *found : repository_.insertOne(host);
        cache_.set(host, instance);
        return instance;
    }

    std::optional<Instance> lookup(std::string host) {
        host = lower(host);
        if (cache_.has(host)) return cache_.get(host);
        auto found = repository_.findOneByHost(host);
        cache_.set(host, found);
        return found;
    }

private:
    static std::string lower(std::string s) {
        std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return std::tolower(c); });
        return s;
    }

    InMemoryInstanceRepository& repository_;
    KeyValueCache& cache_;
};
