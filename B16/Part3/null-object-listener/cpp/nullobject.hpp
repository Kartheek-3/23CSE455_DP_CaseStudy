// Null Object, modelled on JUnit's EngineExecutionListener.NOOP (instance C7).
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

class TestListener {
public:
    virtual ~TestListener() = default;
    virtual void test_finished(const std::string& name, const std::string& outcome) = 0;
};

// The null object: a real listener that does nothing.
class NoOpListener final : public TestListener {
public:
    void test_finished(const std::string&, const std::string&) override {}
    static NoOpListener& instance() {
        static NoOpListener noop;
        return noop;
    }
};

class ConsoleListener final : public TestListener {
public:
    explicit ConsoleListener(std::vector<std::string>& lines) : lines_(lines) {}
    void test_finished(const std::string& name, const std::string& outcome) override { lines_.push_back("listener: " + name + " " + outcome); }

private:
    std::vector<std::string>& lines_;
};

// A reference can never be null, so the runner needs no null check; the default is the null object.
class TestRunner {
public:
    explicit TestRunner(TestListener& listener = NoOpListener::instance()) : listener(listener) {}
    std::string run(const std::vector<NamedTest>& tests) {
        int passed = 0;
        for (const auto& test : tests) {
            listener.test_finished(test.name, test.outcome);
            if (test.outcome == "PASS") ++passed;
        }
        return "result: " + std::to_string(passed) + " passed, " + std::to_string(tests.size() - passed) + " failed";
    }
    TestListener& listener;
};

inline std::string report(const std::string& path) {
    auto tests = parse_tests(read_lines(path));
    std::vector<std::string> out{"== with a console listener =="};
    ConsoleListener console(out);
    auto with_console = TestRunner(console).run(tests);
    out.push_back(with_console);
    out.push_back("== with no listener (null object) ==");
    out.push_back(TestRunner().run(tests));
    return join_lines(out);
}
