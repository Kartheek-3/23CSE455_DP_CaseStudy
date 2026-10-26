#pragma once
#include <algorithm>
#include <cctype>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>

class LogBackend {
public:
    virtual ~LogBackend() = default;
    virtual std::string name() const = 0;
    virtual std::string write(const std::string& level, const std::string& message) const = 0;
};

class PrettyConsoleBackend : public LogBackend {
public:
    std::string name() const override { return "pretty"; }
    std::string write(const std::string& level, const std::string& message) const override {
        std::string upper = level;
        std::transform(upper.begin(), upper.end(), upper.begin(), [](unsigned char c) { return std::toupper(c); });
        return "[" + upper + "] " + message;
    }
};

class JsonConsoleBackend : public LogBackend {
public:
    std::string name() const override { return "json"; }
    std::string write(const std::string& level, const std::string& message) const override {
        return "{\"level\":\"" + level + "\",\"message\":\"" + message + "\"}";
    }
};

inline std::unique_ptr<LogBackend> createLoggingBackend(const std::optional<std::string>& format) {
    if (!format || *format == "pretty") return std::make_unique<PrettyConsoleBackend>();
    if (*format == "json") return std::make_unique<JsonConsoleBackend>();
    throw std::invalid_argument("logging.format must be either pretty or json");
}
