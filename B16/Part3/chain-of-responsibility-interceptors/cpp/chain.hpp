// Chain of Responsibility, modelled on JUnit's InvocationInterceptorChain (instance D9).
#pragma once
#include <functional>
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

struct Invocation {
    std::string name;
    int duration_ms;
    std::string outcome;
    bool disabled;
    std::vector<std::string> trace;
};

// Handler: returns a result, either by calling proceed or without it (which ends the chain).
class Interceptor {
public:
    virtual ~Interceptor() = default;
    virtual std::string label() const = 0;
    virtual std::string intercept(Invocation& invocation, const std::function<std::string()>& proceed) = 0;
};

class LoggingInterceptor final : public Interceptor {
public:
    std::string label() const override { return "logging"; }
    std::string intercept(Invocation&, const std::function<std::string()>& proceed) override { return proceed(); }
};

class DisabledInterceptor final : public Interceptor {
public:
    std::string label() const override { return "disabled"; }
    std::string intercept(Invocation& invocation, const std::function<std::string()>& proceed) override {
        return invocation.disabled ? "SKIPPED (disabled)" : proceed();
    }
};

class TimeoutInterceptor final : public Interceptor {
public:
    std::string label() const override { return "timeout"; }
    std::string intercept(Invocation& invocation, const std::function<std::string()>& proceed) override {
        auto result = proceed();
        if (invocation.duration_ms > kLimitMs)
            return "TIMEOUT (" + std::to_string(invocation.duration_ms) + " ms > " + std::to_string(kLimitMs) + " ms limit)";
        return result;
    }
};

// Link i calls interceptor i with a proceed that runs link i + 1; the last link calls the test.
inline std::string run_chain(const std::vector<std::unique_ptr<Interceptor>>& chain, Invocation& invocation, std::size_t index = 0) {
    if (index == chain.size()) {
        invocation.trace.push_back("invocation");
        return invocation.outcome;
    }
    invocation.trace.push_back(chain[index]->label());
    return chain[index]->intercept(invocation, [&] { return run_chain(chain, invocation, index + 1); });
}

inline std::vector<Invocation> parse(const std::vector<std::string>& lines) {
    std::vector<Invocation> invocations;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        auto f = fields(lines[i]);
        if (f.empty()) continue;
        if (f.size() != 3 && f.size() != 4) throw InputFormatError(where(i) + "expected '<test> <duration-ms> PASS|FAIL [disabled]'");
        if (!is_number(f[1])) throw InputFormatError(where(i) + "duration must be a whole number of milliseconds, got '" + f[1] + "'");
        if (f[2] != "PASS" && f[2] != "FAIL") throw InputFormatError(where(i) + "outcome must be PASS or FAIL, got '" + f[2] + "'");
        if (f.size() == 4 && f[3] != "disabled") throw InputFormatError(where(i) + "unknown flag '" + f[3] + "'");
        invocations.push_back({f[0], std::stoi(f[1]), f[2], f.size() == 4, {}});
    }
    return invocations;
}

inline std::vector<std::unique_ptr<Interceptor>> default_chain() {
    std::vector<std::unique_ptr<Interceptor>> chain;
    chain.push_back(std::make_unique<LoggingInterceptor>());
    chain.push_back(std::make_unique<DisabledInterceptor>());
    chain.push_back(std::make_unique<TimeoutInterceptor>());
    return chain;
}

inline std::string report(const std::string& path) {
    auto chain = default_chain();
    std::vector<std::string> out;
    for (auto& invocation : parse(read_lines(path))) {
        auto result = run_chain(chain, invocation);
        std::string trace;
        for (std::size_t k = 0; k < invocation.trace.size(); ++k) trace += (k ? " > " : "") + invocation.trace[k];
        out.push_back(invocation.name + " -> " + result + "  [" + trace + "]");
    }
    return join_lines(out);
}
