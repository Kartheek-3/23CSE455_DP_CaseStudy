// Test runner for sensor_driver.hpp (reads the shared CSV).
#include <cctype>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <regex>
#include <set>
#include <sstream>
#include <string>
#include <vector>

#include "sensor_driver.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/sensor_driver_cases.csv";

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

std::string run_case(std::map<std::string, std::string>& c) {
    std::set<int> enabled;
    for (const std::string& ch : split(c["enabled"], '|')) enabled.insert(std::stoi(ch));
    RawMap raw;
    for (const std::string& item : split(c["raw"], '|')) {
        const std::size_t eq = item.find('=');
        if (eq != std::string::npos) raw[item.substr(0, eq)] = item.substr(eq + 1);
    }
    Measurements result;
    if (c["input"] == "soil") {
        std::unique_ptr<Seesaw> sensor;
        if (c["raw"] != "unset") sensor.reset(new Seesaw(raw));
        SoilInput device(enabled, sensor.get());
        result = update_measure(device);
    } else {
        const std::string api_key = raw["api_key"], city = raw["city"];
        const bool network_up = raw["network"] != "down";
        raw.erase("api_key");
        raw.erase("city");
        raw.erase("network");
        WeatherApi api(raw, network_up);
        WeatherInput device(enabled, &api, api_key, city);
        result = update_measure(device);
    }
    if (!result.has_value) return "None";
    std::ostringstream out;
    out << std::setprecision(17);
    bool first = true;
    for (const auto& entry : result.values) {
        out << (first ? "" : "|") << entry.first << "=" << entry.second;
        first = false;
    }
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
    std::cout << "Adapter tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
