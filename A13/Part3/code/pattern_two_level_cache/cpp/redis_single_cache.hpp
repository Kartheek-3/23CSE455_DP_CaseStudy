#pragma once
#include <functional>
#include <optional>
#include <string>

// The second level (Redis in Misskey).
class RemoteStore {
public:
    virtual ~RemoteStore() = default;
    virtual std::optional<std::string> get(const std::string& key) = 0;
    virtual void set(const std::string& key, const std::string& value) = 0;
    virtual void remove(const std::string& key) = 0;
};

class MemorySingleCache {
public:
    MemorySingleCache(long lifetime, std::function<long()> clock) : lifetime_(lifetime), clock_(std::move(clock)) {}

    void set(const std::string& value) {
        value_ = value;
        cachedAt_ = clock_();
    }

    std::optional<std::string> get() {
        if (!cachedAt_) return std::nullopt;
        if (clock_() - *cachedAt_ > lifetime_) {
            remove();
            return std::nullopt;
        }
        return value_;
    }

    void remove() {
        value_.reset();
        cachedAt_.reset();
    }

private:
    long lifetime_;
    std::function<long()> clock_;
    std::optional<std::string> value_;
    std::optional<long> cachedAt_;
};

class RedisSingleCache {
public:
    RedisSingleCache(RemoteStore& redis, const std::string& name, long memoryLifetime,
                     std::function<std::string()> fetcher, std::function<long()> clock)
        : redis_(redis), key_("singlecache:" + name), memory_(memoryLifetime, std::move(clock)), fetcher_(std::move(fetcher)) {}

    void set(const std::string& value) {
        memory_.set(value);
        redis_.set(key_, value);
    }

    std::optional<std::string> get() {
        if (auto cached = memory_.get()) return cached;
        auto remote = redis_.get(key_);
        if (!remote) return std::nullopt;
        memory_.set(*remote);
        return remote;
    }

    void remove() {
        memory_.remove();
        redis_.remove(key_);
    }

    std::string fetch() {
        if (auto cached = get()) return *cached;
        std::string value = fetcher_();
        set(value);
        return value;
    }

private:
    RemoteStore& redis_;
    std::string key_;
    MemorySingleCache memory_;
    std::function<std::string()> fetcher_;
};
