// Command, modelled on JUnit's NodeTestTask / MethodInvocation (instance B9).
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

inline std::string join_lines(const std::vector<std::string>& lines) {
    std::string out;
    for (const auto& line : lines) out += line + "\n";
    return out;
}

class Command {
public:
    virtual ~Command() = default;
    // Runs the task and returns the line to print.
    virtual std::string execute(std::vector<std::string>& results) = 0;
};

class RunTestCommand final : public Command {
public:
    RunTestCommand(std::string name, std::string outcome) : name_(std::move(name)), outcome_(std::move(outcome)) {}
    std::string execute(std::vector<std::string>& results) override {
        results.push_back(outcome_);
        return "test " + name_ + " -> " + outcome_;
    }

private:
    std::string name_;
    std::string outcome_;
};

class NoteCommand final : public Command {
public:
    explicit NoteCommand(std::string text) : text_(std::move(text)) {}
    std::string execute(std::vector<std::string>&) override { return "note: " + text_; }

private:
    std::string text_;
};

// Invoker: owns the queued commands and executes them later, in submission order.
class TaskExecutor {
public:
    void submit(std::unique_ptr<Command> command) { queue_.push_back(std::move(command)); }
    std::vector<std::string> run_all() {
        std::vector<std::string> lines;
        for (std::size_t i = 0; i < queue_.size(); ++i) lines.push_back("#" + std::to_string(i + 1) + " " + queue_[i]->execute(results));
        queue_.clear();
        return lines;
    }
    std::vector<std::string> results;

private:
    std::vector<std::unique_ptr<Command>> queue_;
};

inline std::vector<std::unique_ptr<Command>> parse(const std::vector<std::string>& lines) {
    std::vector<std::unique_ptr<Command>> commands;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        auto f = fields(lines[i]);
        if (f.empty()) continue;
        if (f[0] == "test" && f.size() == 3 && (f[2] == "PASS" || f[2] == "FAIL")) {
            commands.push_back(std::make_unique<RunTestCommand>(f[1], f[2]));
        } else if (f[0] == "note" && f.size() > 1) {
            std::string text = f[1];
            for (std::size_t k = 2; k < f.size(); ++k) text += " " + f[k];
            commands.push_back(std::make_unique<NoteCommand>(text));
        } else if (f[0] == "test" || f[0] == "note") {
            throw InputFormatError(where(i) + "expected 'test <name> PASS|FAIL' or 'note <text>'");
        } else {
            throw InputFormatError(where(i) + "unknown command '" + f[0] + "'");
        }
    }
    return commands;
}

inline std::string report(const std::string& path) {
    auto commands = parse(read_lines(path));
    auto count = commands.size();
    TaskExecutor executor;
    for (auto& command : commands) executor.submit(std::move(command));
    std::vector<std::string> out{"queued " + std::to_string(count) + " commands"};
    for (auto& line : executor.run_all()) out.push_back(line);
    auto passed = std::count(executor.results.begin(), executor.results.end(), "PASS");
    out.push_back("executed " + std::to_string(count) + " commands: " + std::to_string(executor.results.size()) + " tests, " +
                  std::to_string(passed) + " passed, " + std::to_string(executor.results.size() - passed) + " failed");
    return join_lines(out);
}
