// Small test runner: prints PASS/FAIL per check and returns 0 only if every check passed.
#include <fstream>
#include <functional>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

#include "runner.hpp"

namespace {

const std::string kData = "../test-data/";

std::string read_file(const std::string& path) {
    std::ifstream in(path, std::ios::binary);
    std::ostringstream text;
    text << in.rdbuf();
    return text.str();
}

std::string trim(const std::string& text) {
    auto first = text.find_first_not_of(" \t\r\n");
    auto last = text.find_last_not_of(" \t\r\n");
    return first == std::string::npos ? "" : text.substr(first, last - first + 1);
}

// Records which tests it saw, to check that a broken listener before it does not get in the way.
class RecordingListener final : public TestExecutionListener {
public:
    std::string name() const override { return "RecordingListener"; }
    void execution_started(const std::string& test_id) override { seen.push_back(test_id); }
    std::vector<std::string> seen;
};

int passed = 0;
int failed = 0;

// A check returns an empty string when it passes, otherwise a description of the problem.
void check(const std::string& name, const std::function<std::string()>& run) {
    std::string problem;
    try {
        problem = run();
    } catch (const std::exception& e) {
        problem = std::string("threw ") + e.what();
    }
    if (problem.empty()) {
        ++passed;
        std::cout << "PASS " << name << '\n';
    } else {
        ++failed;
        std::cout << "FAIL " << name << '\n' << problem << '\n';
    }
}

}  // namespace

int main() {
    check("report matches expected-output.txt", [] {
        std::string actual = report(kData + "events.txt");
        return actual == read_file(kData + "expected-output.txt") ? "" : "got:\n" + actual;
    });
    check("a throwing listener does not stop the next one", [] {
        auto recorder = std::make_shared<RecordingListener>();
        CompositeTestExecutionListener listeners;
        listeners.register_listener(std::make_shared<BrokenListener>());
        listeners.register_listener(recorder);
        listeners.execution_started("T#a");
        bool ok = recorder->seen == std::vector<std::string>{"T#a"} && listeners.failures().size() == 1;
        return ok ? std::string() : "recorder or failures list is wrong";
    });
    check("invalid input is rejected with expected-error.txt", [] {
        std::string expected = trim(read_file(kData + "expected-error.txt"));
        try {
            report(kData + "invalid-events.txt");
        } catch (const EventFormatError& e) {
            return e.what() == expected ? std::string() : std::string("got: ") + e.what();
        }
        return std::string("no error was raised");
    });

    std::cout << passed << " passed, " << failed << " failed\n";
    return failed == 0 ? 0 : 1;
}
