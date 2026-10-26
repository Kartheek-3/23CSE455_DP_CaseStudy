// Factory Method, modelled on JUnit's HierarchicalTestEngine.createExecutorService (instance B2).
#pragma once
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

struct NamedTest {
    std::string name;
    std::string outcome;
};

// Lines of the form "<test> PASS|FAIL".
inline std::vector<NamedTest> parse_tests(const std::vector<std::string>& lines) {
    std::vector<NamedTest> tests;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        auto f = fields(lines[i]);
        if (f.empty()) continue;
        if (f.size() != 2) throw InputFormatError(where(i) + "expected '<test> PASS|FAIL'");
        if (f[1] != "PASS" && f[1] != "FAIL")
            throw InputFormatError(where(i) + "outcome must be PASS or FAIL, got '" + f[1] + "'");
        tests.push_back({f[0], f[1]});
    }
    return tests;
}

inline std::string join_lines(const std::vector<std::string>& lines) {
    std::string out;
    for (const auto& line : lines) out += line + "\n";
    return out;
}

// Product.
class Executor {
public:
    virtual ~Executor() = default;
    virtual std::string describe() const = 0;
    virtual std::vector<std::string> run(const std::vector<NamedTest>& tests) const = 0;
};

class SameThreadExecutor final : public Executor {
public:
    std::string describe() const override { return "same thread"; }
    std::vector<std::string> run(const std::vector<NamedTest>& tests) const override {
        std::vector<std::string> lines;
        for (const auto& t : tests) lines.push_back("[main] " + t.name + " -> " + t.outcome);
        return lines;
    }
};

// Hands tests to its workers in turn (deterministic, so the output can be compared).
class PooledExecutor final : public Executor {
public:
    explicit PooledExecutor(std::size_t workers) : workers_(workers) {}
    std::string describe() const override { return "pool of " + std::to_string(workers_) + " workers"; }
    std::vector<std::string> run(const std::vector<NamedTest>& tests) const override {
        std::vector<std::string> lines;
        for (std::size_t i = 0; i < tests.size(); ++i)
            lines.push_back("[worker-" + std::to_string(i % workers_ + 1) + "] " + tests[i].name + " -> " + tests[i].outcome);
        return lines;
    }

private:
    std::size_t workers_;
};

// Creator: execute() is written once; subclasses implement the factory method create_executor().
class TestEngine {
public:
    virtual ~TestEngine() = default;
    virtual std::string name() const = 0;
    std::vector<std::string> execute(const std::vector<NamedTest>& tests) const {
        std::unique_ptr<Executor> executor = create_executor();  // the engine owns the product it created
        std::vector<std::string> lines{"== " + name() + " ==", "executor: " + executor->describe()};
        for (auto& line : executor->run(tests)) lines.push_back(line);
        return lines;
    }

protected:
    virtual std::unique_ptr<Executor> create_executor() const = 0;
};

class SameThreadEngine final : public TestEngine {
public:
    std::string name() const override { return "same-thread engine"; }

protected:
    std::unique_ptr<Executor> create_executor() const override { return std::make_unique<SameThreadExecutor>(); }
};

class PooledEngine final : public TestEngine {
public:
    std::string name() const override { return "pooled engine"; }

protected:
    std::unique_ptr<Executor> create_executor() const override { return std::make_unique<PooledExecutor>(2); }
};

inline std::string report(const std::string& path) {
    auto tests = parse_tests(read_lines(path));
    std::vector<std::string> out;
    for (auto& line : SameThreadEngine().execute(tests)) out.push_back(line);
    for (auto& line : PooledEngine().execute(tests)) out.push_back(line);
    return join_lines(out);
}
