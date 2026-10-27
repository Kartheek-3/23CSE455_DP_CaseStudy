// Small test runner: prints PASS/FAIL per check and returns 0 only if every check passed.
#include <fstream>
#include <functional>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

#include "tree_parser.hpp"

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
    check("report for tag 'slow' matches expected-output.txt", [] {
        std::string actual = report(kData + "tree.txt", "slow");
        return actual == read_file(kData + "expected-output.txt") ? "" : "got:\n" + actual;
    });
    check("a leaf and a container answer count_tests the same way", [] {
        TestCase leaf("t", {});
        TestContainer engine("engine", "e");
        auto& cls = static_cast<TestContainer&>(engine.add_child(std::make_unique<TestContainer>("class", "C")));
        cls.add_child(std::make_unique<TestCase>("a", std::vector<std::string>{}));
        cls.add_child(std::make_unique<TestCase>("b", std::vector<std::string>{"x"}));
        std::vector<const TestNode*> nodes = {&leaf, &cls, &engine};
        std::vector<int> counts;
        for (const TestNode* node : nodes) counts.push_back(node->count_tests());
        return counts == std::vector<int>{1, 2, 2} ? std::string() : std::string("counts are wrong");
    });
    check("invalid input is rejected with expected-error.txt", [] {
        std::string expected = trim(read_file(kData + "expected-error.txt"));
        try {
            report(kData + "invalid-tree.txt", "slow");
        } catch (const TreeFormatError& e) {
            return e.what() == expected ? std::string() : std::string("got: ") + e.what();
        }
        return std::string("no error was raised");
    });

    std::cout << passed << " passed, " << failed << " failed\n";
    return failed == 0 ? 0 : 1;
}
