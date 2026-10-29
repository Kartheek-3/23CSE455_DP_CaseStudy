// Small test runner: prints PASS/FAIL per check and returns 0 only if every check passed.
#include <functional>
#include <iostream>

#include "template.hpp"

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
        auto actual = report(kData + "tests.txt");
        return actual == read_file(kData + "expected-output.txt") ? std::string() : "got:\n" + actual;
    });
    check("a new engine gets the whole skeleton from one primitive", []() -> std::string {
        struct AlwaysPass final : TestEngine {
            std::string name() const override { return "always-pass"; }

        protected:
            std::string run_test(const std::string&, const std::string&) override { return "PASS"; }
        };
        AlwaysPass engine;
        auto lines = engine.execute({{"a", "FAIL"}});
        std::vector<std::string> expected{"always-pass: start (1 tests)", "  run a -> PASS", "always-pass: done 1 passed, 0 failed"};
        return lines == expected ? "" : "got " + join_lines(lines);
    });
    check("invalid input is rejected with expected-error.txt", []() -> std::string {
        auto expected = trim(read_file(kData + "expected-error.txt"));
        try {
            report(kData + "invalid-tests.txt");
            return "no error was raised";
        } catch (const InputFormatError& error) {
            return expected == error.what() ? "" : std::string("got: ") + error.what();
        }
    });
    std::cout << passed << " passed, " << failed << " failed\n";
    return failed == 0 ? 0 : 1;
}
