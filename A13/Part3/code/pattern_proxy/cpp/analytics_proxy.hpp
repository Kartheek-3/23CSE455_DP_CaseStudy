#pragma once
#include <memory>
#include <stdexcept>
#include <string>

class AnalyticsInstance {
public:
    virtual ~AnalyticsInstance() = default;
    virtual std::string track(const std::string& event) = 0;
    virtual std::string page(const std::string& name) = 0;
    virtual std::string identify(const std::string& user) = 0;
};

class RealAnalytics : public AnalyticsInstance {
public:
    std::string track(const std::string& event) override { return "real:track " + event; }
    std::string page(const std::string& name) override { return "real:page " + name; }
    std::string identify(const std::string& user) override { return "real:identify " + user; }
};

class AnalyticsProxy : public AnalyticsInstance {
public:
    void setAnalytics(std::unique_ptr<AnalyticsInstance> analytics) {
        if (analytics_) throw std::runtime_error("Analytics instance already exists.");
        analytics_ = std::move(analytics);
    }

    std::string track(const std::string& event) override { return analytics_ ? analytics_->track(event) : "noop"; }
    std::string page(const std::string& name) override { return analytics_ ? analytics_->page(name) : "noop"; }
    std::string identify(const std::string& user) override { return analytics_ ? analytics_->identify(user) : "noop"; }

private:
    std::unique_ptr<AnalyticsInstance> analytics_;
};
