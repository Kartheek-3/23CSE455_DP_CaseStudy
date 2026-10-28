// Test runner for setpoint_schedule.hpp (reads the shared CSV).
#include <cctype>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <regex>
#include <sstream>
#include <string>
#include <vector>

#include "setpoint_schedule.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/setpoint_schedule_cases.csv";

std::vector<std::string> split(const std::string& text, char sep) {
    std::vector<std::string> out;
    std::string item;
    std::istringstream in(text);
    while (std::getline(in, item, sep)) out.push_back(item);
    if (text.empty() || text.back() == sep) out.push_back("");
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

std::vector<std::vector<double>> parse_rows(const std::string& text, char row_separator) {
    std::vector<std::vector<double>> rows;
    for (const std::string& row : split(text, row_separator)) {
        std::vector<double> values;
        for (const std::string& n : split(row, ';')) values.push_back(std::stod(n));
        rows.push_back(values);
    }
    return rows;
}

std::string run_case(std::map<std::string, std::string>& c) {
    std::vector<std::unique_ptr<AbstractMethod>> linked;
    std::vector<std::vector<double>> rows;
    if (c["method_type"] == "Cascade") {
        for (const std::string& spec : split(c["params"], '|')) {
            const std::size_t colon = spec.find(':');
            linked.push_back(create_method_handler(spec.substr(0, colon), parse_rows(spec.substr(colon + 1), '/')));
        }
    } else {
        rows = parse_rows(c["params"], '|');
    }
    const std::unique_ptr<AbstractMethod> method = create_method_handler(c["method_type"], rows, std::move(linked));
    const Setpoint result = method->calculate_setpoint(std::stod(c["now"]), std::stod(c["start"]));
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
    std::cout << "Strategy tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
