// Template Method, modelled on JUnit's HierarchicalTestEngine.execute (instance B1).
#pragma once
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

class TestEngine {
public:
    virtual ~TestEngine() = default;

    // The template method: not virtual, so subclasses cannot change the order of the steps.
    std::vector<std::string> execute(const std::vector<NamedTest>& tests) {
        std::vector<std::string> lines{name() + ": start (" + std::to_string(tests.size()) + " tests)"};
        int passed = 0;
        for (const auto& test : tests) {
            before_each(test.name, lines);
            auto result = run_test(test.name, test.outcome);
            lines.push_back("  run " + test.name + " -> " + result);
            after_each(test.name, lines);
            if (result == "PASS") ++passed;
        }
        lines.push_back(name() + ": done " + std::to_string(passed) + " passed, " + std::to_string(tests.size() - passed) + " failed");
        return lines;
    }

    virtual std::string name() const = 0;

protected:
    // Primitive operation.
    virtual std::string run_test(const std::string& name, const std::string& outcome) = 0;
    // Hooks: do nothing unless overridden.
    virtual void before_each(const std::string&, std::vector<std::string>&) {}
    virtual void after_each(const std::string&, std::vector<std::string>&) {}
};

class SimpleEngine final : public TestEngine {
public:
    std::string name() const override { return "simple"; }

protected:
    std::string run_test(const std::string&, const std::string& outcome) override { return outcome; }
};

class LifecycleEngine final : public TestEngine {
public:
    std::string name() const override { return "lifecycle"; }

protected:
    std::string run_test(const std::string&, const std::string& outcome) override { return outcome; }
    void before_each(const std::string& name, std::vector<std::string>& lines) override { lines.push_back("  beforeEach " + name); }
    void after_each(const std::string& name, std::vector<std::string>& lines) override { lines.push_back("  afterEach " + name); }
};

inline std::string report(const std::string& path) {
    auto tests = parse_tests(read_lines(path));
    SimpleEngine simple;
    LifecycleEngine lifecycle;
    std::vector<std::string> out;
    for (TestEngine* engine : {static_cast<TestEngine*>(&simple), static_cast<TestEngine*>(&lifecycle)}) {
        out.push_back("== " + engine->name() + " ==");
        for (auto& line : engine->execute(tests)) out.push_back(line);
    }
    return join_lines(out);
}
