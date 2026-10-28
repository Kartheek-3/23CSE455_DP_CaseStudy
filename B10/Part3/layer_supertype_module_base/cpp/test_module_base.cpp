// Test runner for module_base.hpp (reads the shared CSV).
#include <algorithm>
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

#include "module_base.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/module_base_cases.csv";

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

std::string fmt(const OptionValue& v) {
    std::ostringstream out;
    out << std::setprecision(17);
    switch (v.type) {
        case OptionValue::None: out << "None"; break;
        case OptionValue::Integer: out << v.integer; break;
        case OptionValue::Float: out << v.number; break;
        case OptionValue::Bool: out << (v.flag ? "true" : "false"); break;
        case OptionValue::Text: out << v.text; break;
    }
    return out.str();
}

std::vector<OptionDef> option_defs(const std::string& text) {
    const char* keys[] = {"id", "type", "default_value", "required"};
    std::vector<OptionDef> defs;
    for (const std::string& item : split(text, '|')) {
        const std::vector<std::string> fields = split(item, ':');
        OptionDef def;
        for (std::size_t i = 0; i < 4; ++i) if (fields[i] != "!") def[keys[i]] = fields[i];
        defs.push_back(def);
    }
    return defs;
}

TextMap pairs(const std::string& text) {
    TextMap out;
    for (const std::string& item : split(text, '|')) {
        const std::size_t eq = item.find('=');
        if (eq == std::string::npos) continue;
        std::string value = item.substr(eq + 1);
        std::replace(value.begin(), value.end(), ';', ',');
        out[item.substr(0, eq)] = value;
    }
    return out;
}

template <typename Member, typename Other>
std::string run_member(std::map<std::string, std::string>& c) {
    OptionStore store;
    Member member("u1", store);
    member.setup_custom_options(option_defs(c["option_defs"]), pairs(c["stored"]));
    std::string result;
    for (const auto& entry : member.options) result += (result.empty() ? "" : "|") + entry.first + "=" + fmt(entry.second);
    if (!member.errors.empty()) result += (result.empty() ? "" : "|") + std::string("errors=") + std::to_string(member.errors.size());
    if (c["persist"] != "-") {
        const std::size_t eq = c["persist"].find('=');
        const std::string name = c["persist"].substr(0, eq);
        member.set_custom_option(name, c["persist"].substr(eq + 1));
        std::string value;
        result += "|stored=" + (member.get_custom_option(name, value) ? value : std::string("None"));
        Other other("u1", store);
        result += "|other_table=" + (other.get_custom_option(name, value) ? value : std::string("None"));
    }
    return result;
}

std::string run_case(std::map<std::string, std::string>& c) {
    if (c["member"] == "input") return run_member<AbstractInput, AbstractFunction>(c);
    return run_member<AbstractFunction, AbstractInput>(c);
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
    std::cout << "Layer Supertype tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
