// Test runner for daemon_rpc.hpp (reads the shared CSV).
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

#include "daemon_rpc.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/daemon_rpc_cases.csv";
const char* URI = "PYRO:mycodo@localhost:9080";

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
    const std::string spec = c["daemon"];
    const std::size_t colon = spec.find(':');
    const std::string kind = spec.substr(0, colon);
    const std::string arg = colon == std::string::npos ? "" : spec.substr(colon + 1);
    std::unique_ptr<Daemon> daemon;
    if (kind == "up") daemon.reset(new Daemon(0, ""));
    else if (kind == "slow") daemon.reset(new Daemon(std::stod(arg), ""));
    else if (kind == "unhealthy") daemon.reset(new Daemon(0, arg));
    Network network;
    if (daemon) network[URI] = daemon.get();
    DaemonControl control(network, URI, c["timeout"].empty() ? 0 : std::stod(c["timeout"]));
    std::string results;
    for (const std::string& operation : split(c["operations"], '|')) {
        const std::vector<std::string> p = split(operation, ':');
        std::string result;
        if (p[0] == "check_daemon") result = control.check_daemon();
        else if (p[0] == "output_on") result = control.output_on(p[1], std::stod(p[3]), std::stoi(p[2]));
        else if (p[0] == "output_off") result = control.output_off(p[1], std::stoi(p[2]));
        else if (p[0] == "output_state") result = control.output_state(p[1], std::stoi(p[2]));
        else result = control.output_on_off(p[1], p[3], std::stod(p[4]), std::stoi(p[2]));
        results += (results.empty() ? "" : "|") + result;
    }
    return results;
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
    std::cout << "Proxy tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
