#pragma once
#include <functional>
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>

// Target: what the application needs from a telemetry backend.
class TelemetryAdapter {
public:
    virtual ~TelemetryAdapter() = default;
    virtual void captureMessage(const std::string& message, const std::optional<std::string>& userId) = 0;
    virtual std::string startSpan(const std::string& name, const std::function<std::string()>& fn) = 0;
    virtual void shutdown() = 0;
};

// Adaptee: the part of the Sentry SDK the adapter uses.
class SentryClient {
public:
    virtual ~SentryClient() = default;
    virtual void captureMessage(const std::string& message, const std::map<std::string, std::string>& options) = 0;
    virtual std::string startSpan(const std::string& name, const std::function<std::string()>& fn) = 0;
    virtual void close(int timeoutMs) = 0;
};

class SentryTelemetryAdapter : public TelemetryAdapter {
public:
    explicit SentryTelemetryAdapter(std::shared_ptr<SentryClient> sentry) : sentry_(std::move(sentry)) {}

    void captureMessage(const std::string& message, const std::optional<std::string>& userId) override {
        std::map<std::string, std::string> options{{"level", "error"}};
        if (userId) options["user.id"] = *userId;
        sentry_->captureMessage(message, options);
    }

    std::string startSpan(const std::string& name, const std::function<std::string()>& fn) override {
        return sentry_->startSpan(name, fn);
    }

    void shutdown() override { sentry_->close(kDefaultShutdownTimeout); }

private:
    static constexpr int kDefaultShutdownTimeout = 5000;
    std::shared_ptr<SentryClient> sentry_;
};

class TelemetryRegistry {
public:
    explicit TelemetryRegistry(std::vector<std::shared_ptr<TelemetryAdapter>> adapters) : adapters_(std::move(adapters)) {}

    void captureMessage(const std::string& message, const std::optional<std::string>& userId) {
        for (auto& adapter : adapters_) adapter->captureMessage(message, userId);
    }

    std::string startSpan(const std::string& name, const std::function<std::string()>& fn) {
        return span(0, name, fn);
    }

    void shutdown() {
        for (auto& adapter : adapters_) adapter->shutdown();
    }

private:
    std::string span(size_t index, const std::string& name, const std::function<std::string()>& fn) {
        if (index == adapters_.size()) return fn();
        return adapters_[index]->startSpan(name, [&] { return span(index + 1, name, fn); });
    }

    std::vector<std::shared_ptr<TelemetryAdapter>> adapters_;
};
