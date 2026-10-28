// Decorator, modelled on JUnit's timeout invocation wrappers (instance D10).
#pragma once
#include <map>
#include <memory>
#include <cstddef>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

// A bad input line; the message is "line N: ...".
class InputFormatError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

// Splits a line into fields; returns an empty vector for blank lines and comments.
inline std::vector<std::string> fields(const std::string& line) {
    std::istringstream in(line);
    std::vector<std::string> out;
    for (std::string field; in >> field;) out.push_back(field);
    if (!out.empty() && out[0].rfind('#', 0) == 0) out.clear();
    return out;
}

inline std::vector<std::string> read_lines(const std::string& path) {
    std::ifstream in(path);
    if (!in) throw std::runtime_error("cannot open " + path);
    std::vector<std::string> lines;
    for (std::string line; std::getline(in, line);) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}

inline std::string where(std::size_t index) { return "line " + std::to_string(index + 1) + ": "; }

inline bool is_number(const std::string& text) {
    return !text.empty() && text.find_first_not_of("0123456789") == std::string::npos;
}

inline std::string join_lines(const std::vector<std::string>& lines) {
    std::string out;
    for (const auto& line : lines) out += line + "\n";
    return out;
}

inline constexpr int kLimitMs = 100;

// Component.
class Invocation {
public:
    virtual ~Invocation() = default;
    virtual std::string name() const = 0;
    virtual int duration_ms() const = 0;
    virtual std::string proceed() = 0;
};

// Concrete component: the test method itself (its duration is given, not measured).
class TestInvocation final : public Invocation {
public:
    TestInvocation(std::string name, int duration_ms, std::string outcome)
        : name_(std::move(name)), duration_ms_(duration_ms), outcome_(std::move(outcome)) {}
    std::string name() const override { return name_; }
    int duration_ms() const override { return duration_ms_; }
    std::string proceed() override { return outcome_; }

private:
    std::string name_;
    int duration_ms_;
    std::string outcome_;
};

// Base decorator: owns the wrapped invocation and forwards everything to it.
class InvocationDecorator : public Invocation {
public:
    explicit InvocationDecorator(std::unique_ptr<Invocation> inner) : inner_(std::move(inner)) {}
    std::string name() const override { return inner_->name(); }
    int duration_ms() const override { return inner_->duration_ms(); }
    std::string proceed() override { return inner_->proceed(); }

protected:
    std::unique_ptr<Invocation> inner_;
};

class TimeoutInvocation final : public InvocationDecorator {
public:
    TimeoutInvocation(std::unique_ptr<Invocation> inner, int limit_ms) : InvocationDecorator(std::move(inner)), limit_ms_(limit_ms) {}
    std::string proceed() override {
        auto result = inner_->proceed();
        if (duration_ms() > limit_ms_)
            return "TIMEOUT (" + std::to_string(duration_ms()) + " ms > " + std::to_string(limit_ms_) + " ms limit)";
        return result;
    }

private:
    int limit_ms_;
};

class LoggingInvocation final : public InvocationDecorator {
public:
    LoggingInvocation(std::unique_ptr<Invocation> inner, std::vector<std::string>& log) : InvocationDecorator(std::move(inner)), log_(log) {}
    std::string proceed() override {
        log_.push_back("[log] calling " + name());
        auto result = inner_->proceed();
        log_.push_back("[log] " + name() + " -> " + result);
        return result;
    }

private:
    std::vector<std::string>& log_;
};

inline std::vector<std::unique_ptr<Invocation>> parse(const std::vector<std::string>& lines) {
    std::vector<std::unique_ptr<Invocation>> invocations;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        auto f = fields(lines[i]);
        if (f.empty()) continue;
        if (f.size() != 3) throw InputFormatError(where(i) + "expected '<test> <duration-ms> PASS|FAIL'");
        if (!is_number(f[1])) throw InputFormatError(where(i) + "duration must be a whole number of milliseconds, got '" + f[1] + "'");
        if (f[2] != "PASS" && f[2] != "FAIL") throw InputFormatError(where(i) + "outcome must be PASS or FAIL, got '" + f[2] + "'");
        invocations.push_back(std::make_unique<TestInvocation>(f[0], std::stoi(f[1]), f[2]));
    }
    return invocations;
}

inline std::string report(const std::string& path) {
    std::vector<std::string> log;
    std::vector<std::pair<std::string, int>> counts{{"PASS", 0}, {"FAIL", 0}, {"TIMEOUT", 0}};
    for (auto& invocation : parse(read_lines(path))) {
        LoggingInvocation decorated(std::make_unique<TimeoutInvocation>(std::move(invocation), kLimitMs), log);
        auto kind = decorated.proceed();
        kind = kind.substr(0, kind.find(' '));
        for (auto& [key, value] : counts)
            if (key == kind) ++value;
    }
    log.push_back("== Summary ==");
    for (const auto& [key, value] : counts) log.push_back(key + " " + std::to_string(value));
    return join_lines(log);
}
