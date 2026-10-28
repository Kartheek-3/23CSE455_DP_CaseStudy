// Test runner for setpoint_interpolation.hpp (reads the shared CSV).
#include <cmath>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <regex>
#include <sstream>
#include <string>
#include <vector>

#include "setpoint_interpolation.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/setpoint_interpolation_cases.csv";

std::vector<std::string> split(const std::string& text, char sep) {
    std::vector<std::string> out;
    std::string item;
    std::istringstream in(text);
    while (std::getline(in, item, sep)) out.push_back(item);
    if (!text.empty() && text.back() == sep) out.push_back("");
    if (text.empty()) out.push_back("");
    return out;
}

std::vector<std::string> tokens(const std::string& text) {
    std::vector<std::string> out;
    std::string current;
    for (char ch : text) {
        if (std::isspace(static_cast<unsigned char>(ch)) || std::string("|;=,()").find(ch) != std::string::npos) {
            if (!current.empty()) out.push_back(current);
            current.clear();
        } else {
            current += ch;
        }
    }
    if (!current.empty()) out.push_back(current);
    return out;
}

bool same(const std::string& expected, const std::string& actual) {
    static const std::regex number("^[-+]?(\\d+\\.?\\d*|\\.\\d+)([eE][-+]?\\d+)?$");
    const std::vector<std::string> a = tokens(expected), b = tokens(actual);
    if (a.size() != b.size()) return false;
    for (std::size_t i = 0; i < a.size(); ++i) {
        if (std::regex_match(a[i], number) && std::regex_match(b[i], number)) {
            if (std::fabs(std::stod(a[i]) - std::stod(b[i])) > 1e-9) return false;
        } else if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

std::string run_case(std::map<std::string, std::string>& c) {
    std::vector<MethodRow> rows;
    for (const std::string& item : split(c["rows"], '|')) {
        const std::vector<std::string> f = split(item, ';');
        rows.push_back({f[0], f[1], std::stod(f[2]), !f[3].empty(), f[3].empty() ? 0.0 : std::stod(f[3])});
    }
    std::unique_ptr<DateMethod> method;
    if (c["method"] == "Daily") method.reset(new DailyMethod(rows));
    else method.reset(new DateMethod(rows));
    const Setpoint result = method->calculate_setpoint(c["now"]);
    std::ostringstream out;
    out << std::setprecision(17);
    if (result.has_value) out << result.value; else out << "None";
    out << "|" << (result.ended ? "true" : "false");
    return out.str();
}
}  // namespace

int main() {
    std::ifstream file(CSV_PATH);
    if (!file) {
        std::cout << "cannot open " << CSV_PATH << std::endl;
        return 1;
    }
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(file, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        if (line.find_first_not_of(" \t") != std::string::npos) lines.push_back(line);
    }
    const std::vector<std::string> header = split(lines[0], ',');
    int passed = 0, total = 0;
    for (std::size_t n = 1; n < lines.size(); ++n) {
        const std::vector<std::string> fields = split(lines[n], ',');
        std::map<std::string, std::string> c;
        for (std::size_t i = 0; i < header.size(); ++i) c[header[i]] = fields[i];
        ++total;
        const std::string expected = c["expected"];
        std::string actual;
        bool raised = false;
        try {
            actual = run_case(c);
        } catch (const std::exception& e) {
            actual = e.what();
            raised = true;
        }
        const bool ok = expected == "ERROR" ? raised : (!raised && same(expected, actual));
        if (ok) ++passed;
        else std::cout << "FAIL " << c["case_id"] << ": expected " << expected << ", got "
                       << (raised ? "ERROR " : "") << actual << std::endl;
    }
    std::cout << "Template Method tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
