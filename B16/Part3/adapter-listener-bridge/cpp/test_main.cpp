// Small test runner: prints PASS/FAIL per check and returns 0 only if every check passed.
#include <functional>
#include <iostream>

#include "adapter.hpp"

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

int passed = 0;
int failed = 0;

// A check returns an empty string when it passes, otherwise a description of the problem.
void check(const std::string& name, const std::function<std::string()>& run) {
    std::string problem;
    try {
        problem = run();
    } catch (const std::exception& error) {
        problem = std::string("threw ") + error.what();
    }
    if (problem.empty()) {
        ++passed;
        std::cout << "PASS " << name << "\n";
    } else {
        ++failed;
        std::cout << "FAIL " << name << "\n" << problem << "\n";
    }
}

}  // namespace

int main() {
    check("report matches expected-output.txt", [] {
        auto actual = report(kData + "events.txt");
        return actual == read_file(kData + "expected-output.txt") ? std::string() : "got:\n" + actual;
    });
    check("the adapter converts engine calls into client calls", []() -> std::string {
        struct Recorder final : TestListener {
            void test_finished(const TestIdentifier& id, const std::string& status) override {
                got = id.display_name + "|" + (id.is_test ? "test" : "container") + "|" + id.parent_name.value_or("-") + "|" + status;
            }
            std::string got;
        };
        Recorder recorder;
        ListenerAdapter(recorder).execution_finished("[engine:e]/[class:CalcTests]/[method:add]", "FAILED");
        return recorder.got == "add|test|CalcTests|FAILED" ? "" : "got " + recorder.got;
    });
    check("invalid input is rejected with expected-error.txt", []() -> std::string {
        auto expected = trim(read_file(kData + "expected-error.txt"));
        try {
            report(kData + "invalid-events.txt");
            return "no error was raised";
        } catch (const InputFormatError& error) {
            return expected == error.what() ? "" : std::string("got: ") + error.what();
        }
    });
    std::cout << passed << " passed, " << failed << " failed\n";
    return failed == 0 ? 0 : 1;
}
