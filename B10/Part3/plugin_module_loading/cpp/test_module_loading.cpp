// Test runner for module_loading.hpp (reads the shared CSV).
#include <cctype>
#include <cmath>
#include <fstream>
#include <iostream>
#include <map>
#include <memory>
#include <regex>
#include <sstream>
#include <string>
#include <vector>

#include "module_loading.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/module_loading_cases.csv";

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

bool check(const std::string& expected, const std::string& actual, bool raised) {
    return expected == "ERROR" ? raised : (!raised && same(expected, actual));
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
        std::vector<std::string> files;
        for (const std::string& f : split(c["files"], '|')) if (!f.empty()) files.push_back(f);
        std::vector<std::string> errors;
        Registry registry;
        std::string registry_text, device;
        bool raised = false, device_raised = false;
        try {
            registry = parse_input_information(files, errors);
            for (const auto& entry : registry)
                registry_text += (registry_text.empty() ? "" : "|") + entry.first + "=" + entry.second.at("file_path");
            if (!errors.empty())
                registry_text += (registry_text.empty() ? "" : "|") + std::string("duplicates=") + std::to_string(errors.size());
            if (registry_text.empty()) registry_text = "none";
        } catch (const std::exception& e) {
            registry_text = e.what();
            raised = true;
        }
        bool ok = check(c["expected_registry"], registry_text, raised);
        if (ok && !raised) {
            try {
                device = InputController(registry).initialize(c["device"])->describe();
            } catch (const std::exception& e) {
                device = e.what();
                device_raised = true;
            }
            ok = check(c["expected_device"], device, device_raised);
        }
        if (ok) ++passed;
        else std::cout << "FAIL " << c["case_id"] << ": expected " << c["expected_registry"] << " / " << c["expected_device"]
                       << ", got " << (raised ? "ERROR " : "") << registry_text << " / "
                       << (device_raised ? "ERROR " : "") << device << std::endl;
    }
    std::cout << "Plugin tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
