// Strategy, modelled on JUnit's PostDiscoveryFilter (instance A3).
#pragma once
#include <algorithm>
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

struct TestCase {
    std::string name;
    std::vector<std::string> tags;
    bool has_tag(const std::string& tag) const { return std::find(tags.begin(), tags.end(), tag) != tags.end(); }
};

// Strategy: decides whether one test is selected.
class TestFilter {
public:
    virtual ~TestFilter() = default;
    virtual bool includes(const TestCase& test) const = 0;
    virtual std::string describe() const = 0;
};

class IncludeTag final : public TestFilter {
public:
    explicit IncludeTag(std::string tag) : tag_(std::move(tag)) {}
    bool includes(const TestCase& test) const override { return test.has_tag(tag_); }
    std::string describe() const override { return "include-tag " + tag_; }

private:
    std::string tag_;
};

class ExcludeTag final : public TestFilter {
public:
    explicit ExcludeTag(std::string tag) : tag_(std::move(tag)) {}
    bool includes(const TestCase& test) const override { return !test.has_tag(tag_); }
    std::string describe() const override { return "exclude-tag " + tag_; }

private:
    std::string tag_;
};

class NameContains final : public TestFilter {
public:
    explicit NameContains(std::string text) : text_(std::move(text)) {}
    bool includes(const TestCase& test) const override { return test.name.find(text_) != std::string::npos; }
    std::string describe() const override { return "name-contains " + text_; }

private:
    std::string text_;
};

// Context: holds one strategy (borrowed) and applies it to every test.
class TestSelector {
public:
    explicit TestSelector(const TestFilter& filter) : filter_(filter) {}
    std::vector<TestCase> select(const std::vector<TestCase>& tests) const {
        std::vector<TestCase> out;
        std::copy_if(tests.begin(), tests.end(), std::back_inserter(out),
                     [this](const TestCase& t) { return filter_.includes(t); });
        return out;
    }

private:
    const TestFilter& filter_;
};

inline std::vector<TestCase> parse(const std::vector<std::string>& lines) {
    std::vector<TestCase> tests;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        auto f = fields(lines[i]);
        if (f.empty()) continue;
        auto hash = f[0].find('#');
        if (hash == std::string::npos || hash == 0 || hash + 1 == f[0].size() || f[0].find('#', hash + 1) != std::string::npos)
            throw InputFormatError(where(i) + "test name must look like Class#method, got '" + f[0] + "'");
        tests.push_back({f[0], std::vector<std::string>(f.begin() + 1, f.end())});
    }
    return tests;
}

inline std::string report(const std::string& path) {
    auto tests = parse(read_lines(path));
    std::vector<std::unique_ptr<TestFilter>> strategies;
    strategies.push_back(std::make_unique<IncludeTag>("fast"));
    strategies.push_back(std::make_unique<ExcludeTag>("flaky"));
    strategies.push_back(std::make_unique<NameContains>("String"));
    std::string out;
    for (const auto& strategy : strategies) {
        auto selected = TestSelector(*strategy).select(tests);
        out += "== " + strategy->describe() + " ==\n";
        for (const auto& test : selected) out += test.name + "\n";
        out += "selected " + std::to_string(selected.size()) + " of " + std::to_string(tests.size()) + "\n";
    }
    return out;
}
