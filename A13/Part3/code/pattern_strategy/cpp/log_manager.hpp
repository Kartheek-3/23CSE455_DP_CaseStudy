#pragma once
#include <algorithm>
#include <cctype>
#include <memory>
#include <stdexcept>
#include <string>

class LogBackend {
public:
    virtual ~LogBackend() = default;
    virtual std::string write(const std::string& level, const std::string& message) const = 0;
};

class BootstrapConsoleBackend : public LogBackend {
public:
    std::string write(const std::string& level, const std::string& message) const override {
        return level + ": " + message;
    }
};

class PrettyConsoleBackend : public LogBackend {
public:
    std::string write(const std::string& level, const std::string& message) const override {
        std::string upper = level;
        std::transform(upper.begin(), upper.end(), upper.begin(), [](unsigned char c) { return std::toupper(c); });
        return "[" + upper + "] " + message;
    }
};

class JsonConsoleBackend : public LogBackend {
public:
    std::string write(const std::string& level, const std::string& message) const override {
        return "{\"level\":\"" + level + "\",\"message\":\"" + message + "\"}";
    }
};

class LogManager {
public:
    explicit LogManager(std::shared_ptr<LogBackend> backend) : backend_(std::move(backend)) {}

    void setBackend(std::shared_ptr<LogBackend> backend) {
        if (!backend) throw std::invalid_argument("backend is required");
        backend_ = std::move(backend);
    }

    std::string log(const std::string& level, const std::string& message) const {
        return backend_->write(level, message);
    }

private:
    std::shared_ptr<LogBackend> backend_;
};
