// Test runner for automation_actions.hpp (reads the shared CSV).
#include <algorithm>
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

#include "automation_actions.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/automation_actions_cases.csv";

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

std::map<std::string, std::string> pairs(const std::string& text) {
    std::map<std::string, std::string> out;
    for (const std::string& item : split(text, '|')) {
        const std::size_t eq = item.find('=');
        if (eq != std::string::npos) out[item.substr(0, eq)] = item.substr(eq + 1);
    }
    return out;
}

std::string get(const std::map<std::string, std::string>& m, const std::string& key, const std::string& fallback) {
    const auto found = m.find(key);
    return found == m.end() ? fallback : found->second;
}

std::vector<std::string> run_case(std::map<std::string, std::string>& c) {
    const std::map<std::string, std::string> config = pairs(c["config"]);
    EmailService service(std::stoi(get(config, "hourly_max", "5")));
    OutputControl control({{"pump1", "Main Pump"}, {"valve2", "Drip Valve"}});
    ActionInvoker invoker;
    std::string email = get(config, "email", "grower@farm.org");
    std::replace(email.begin(), email.end(), ';', ',');
    invoker.register_action("email-1", std::unique_ptr<AbstractFunctionAction>(new EmailAction(email, service)));
    invoker.register_action("output-1", std::unique_ptr<AbstractFunctionAction>(new OutputOnOffAction(
        get(config, "output_id", "pump1"), std::stoi(get(config, "channel", "0")), get(config, "state", "on"),
        std::stod(get(config, "duration", "0")), control)));
    DictVars dict_vars{c["message"] != "-", c["message"] != "-" ? c["message"] : "", pairs(c["value"])};
    const DictVars& result = invoker.trigger_action(c["action_id"], dict_vars);
    std::string log;
    for (const std::string& entry : service.log) log += (log.empty() ? "" : "|") + entry;
    for (const std::string& entry : control.log) log += (log.empty() ? "" : "|") + entry;
    return {result.message, log.empty() ? "none" : log};
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
        const std::vector<std::string> expected = {c["expected_message"], c["expected_log"]};
        std::vector<std::string> actual;
        bool raised = false;
        try {
            actual = run_case(c);
        } catch (const std::exception& e) {
            actual = {e.what(), ""};
            raised = true;
        }
        const bool ok = expected[0] == "ERROR" ? raised
            : (!raised && same(expected[0], actual[0]) && same(expected[1], actual[1]));
        if (ok) ++passed;
        else std::cout << "FAIL " << c["case_id"] << ": expected " << expected[0] << " / " << expected[1] << ", got "
                       << (raised ? "ERROR " : "") << actual[0] << " / " << actual[1] << std::endl;
    }
    std::cout << "Command tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
