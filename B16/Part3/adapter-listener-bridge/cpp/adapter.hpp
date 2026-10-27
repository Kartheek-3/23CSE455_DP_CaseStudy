// Adapter, modelled on JUnit's ExecutionListenerAdapter (instance B7).
#pragma once
#include <optional>
#include <regex>
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

// Target: what the engine calls, with raw unique ids.
class EngineListener {
public:
    virtual ~EngineListener() = default;
    virtual void execution_started(const std::string& unique_id) = 0;
    virtual void execution_finished(const std::string& unique_id, const std::string& status) = 0;
};

struct TestIdentifier {
    std::string display_name;
    bool is_test;
    std::optional<std::string> parent_name;
    std::string describe() const {
        return std::string(is_test ? "test " : "container ") + display_name + (parent_name ? " (in " + *parent_name + ")" : "");
    }
};

// Adaptee: the client-side interface, in terms of TestIdentifier.
class TestListener {
public:
    virtual ~TestListener() = default;
    virtual void test_started(const TestIdentifier&) {}
    virtual void test_finished(const TestIdentifier&, const std::string&) {}
};

class PrintingTestListener final : public TestListener {
public:
    void test_started(const TestIdentifier& id) override { lines.push_back("started  " + id.describe()); }
    void test_finished(const TestIdentifier& id, const std::string& status) override {
        lines.push_back("finished " + id.describe() + ": " + status);
    }
    std::vector<std::string> lines;
};

inline TestIdentifier to_identifier(const std::string& unique_id) {
    static const std::regex segment(R"(\[([a-z-]+):([^\]]+)\])");
    std::vector<std::pair<std::string, std::string>> segments;
    for (std::sregex_iterator it(unique_id.begin(), unique_id.end(), segment), end; it != end; ++it)
        segments.emplace_back((*it)[1], (*it)[2]);
    const auto& [kind, name] = segments.back();
    std::optional<std::string> parent;
    if (segments.size() > 1) parent = segments[segments.size() - 2].second;
    return {name, kind == "method", parent};
}

// Adapter: implements the Target and forwards to the Adaptee (borrowed) in its own terms.
class ListenerAdapter final : public EngineListener {
public:
    explicit ListenerAdapter(TestListener& listener) : listener_(listener) {}
    void execution_started(const std::string& unique_id) override { listener_.test_started(to_identifier(unique_id)); }
    void execution_finished(const std::string& unique_id, const std::string& status) override {
        listener_.test_finished(to_identifier(unique_id), status);
    }

private:
    TestListener& listener_;
};

// The engine side: knows only EngineListener and raw unique ids.
inline void run_engine(const std::vector<std::string>& lines, EngineListener& listener) {
    static const std::regex unique_id(R"((\[[a-z-]+:[^\]]+\])(/\[[a-z-]+:[^\]]+\])*)");
    for (std::size_t i = 0; i < lines.size(); ++i) {
        auto f = fields(lines[i]);
        if (f.empty()) continue;
        if (f[0] != "started" && f[0] != "finished") throw InputFormatError(where(i) + "unknown event '" + f[0] + "'");
        if (f.size() != (f[0] == "started" ? 2u : 3u)) throw InputFormatError(where(i) + "malformed " + f[0] + " event");
        if (!std::regex_match(f[1], unique_id)) throw InputFormatError(where(i) + "malformed unique id '" + f[1] + "'");
        if (f[0] == "started") {
            listener.execution_started(f[1]);
        } else if (f[2] == "SUCCESSFUL" || f[2] == "FAILED" || f[2] == "ABORTED") {
            listener.execution_finished(f[1], f[2]);
        } else {
            throw InputFormatError(where(i) + "unknown status '" + f[2] + "'");
        }
    }
}

inline std::string report(const std::string& path) {
    PrintingTestListener client;
    ListenerAdapter adapter(client);
    run_engine(read_lines(path), adapter);
    return join_lines(client.lines);
}
