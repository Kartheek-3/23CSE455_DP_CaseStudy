#include "main.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

static std::vector<std::string> readLines(const std::string& file) {
    std::ifstream stream("../../common_specs/" + file);
    if (!stream) throw std::runtime_error("Missing shared fixture: " + file);
    std::string line;
    std::vector<std::string> lines;
    std::getline(stream, line);  // header
    while (std::getline(stream, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}
static std::vector<std::string> split(const std::string& row) {
    std::stringstream stream(row);
    std::string cell;
    std::vector<std::string> cells;
    while (std::getline(stream, cell, '\t')) cells.push_back(cell);
    return cells;
}
int main() {
    try {
        auto cases = readLines("strategy_cases.tsv");
        auto expected = readLines("strategy_expected.tsv");
        QuoteEvaluator evaluator;
        int passed = 0;
        for (std::size_t i = 0; i < cases.size(); ++i) {
            auto f = split(cases[i]);
            std::string actual = evaluator.evaluate(f.at(0), f.at(1), f.at(2), f.at(3), f.at(4));
            std::cout << actual << '\n';
            if (i < expected.size() && actual == expected[i]) ++passed;
            else std::cerr << "FAIL " << f[0] << ": expected=" <<
                (i < expected.size() ? expected[i] : "MISSING") << " actual=" << actual << '\n';
        }
        int failures = static_cast<int>(cases.size()) - passed +
                       static_cast<int>(expected.size() > cases.size() ? expected.size() - cases.size() : 0);
        std::cerr << "RESULT: passed=" << passed << "/" << cases.size()
                  << " failures=" << failures << " errors=0\n";
        return failures == 0 && cases.size() == 15 ? 0 : 1;
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << '\n';
        return 2;
    }
}
