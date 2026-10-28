// Test runner for user_role.hpp (reads the shared CSV).
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

#include "user_role.hpp"

namespace {
const char* CSV_PATH = "../../test-cases/user_role_cases.csv";

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
    Session session;
    std::vector<std::unique_ptr<CRUDMixin>> owned;  // the runner owns every record
    std::map<std::string, User*> users;
    std::string results;
    for (const std::string& operation : split(c["operations"], '|')) {
        const std::vector<std::string> p = split(operation, ':');
        std::string result;
        if (p[0] == "user") {
            User* user = new User(session, p[1], p[2]);
            owned.emplace_back(user);
            users[p[1]] = user;
            user->set_password(p[3]);
            result = user->save() ? "saved" : "None";
        } else if (p[0] == "role") {
            Role* role = new Role(session, p[1] != "!", p[1] != "!" ? p[1] : "");
            owned.emplace_back(role);
            result = role->save() ? "saved" : "None";
        } else if (p[0] == "delete_user" || p[0] == "delete_new") {
            User* user = users[p[1]];
            if (p[0] == "delete_new") {
                user = new User(session, p[1], p[1] + "@new");
                owned.emplace_back(user);
            }
            const std::size_t log_size = session.log.size();
            user->del();
            result = session.log.size() > log_size ? "error_logged" : "deleted";
        } else if (p[0] == "check") {
            const User* user = users[p[1]];
            result = User::check_password(p[2], user->password_hash) == user->password_hash ? "match" : "no_match";
        } else if (p[0] == "check_hash") {
            result = User::check_password(p[1], p[2]);
        } else if (p[0] == "count_users") {
            result = std::to_string(session.count<User>());
        } else {
            result = std::to_string(session.count<Role>());
        }
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
    std::cout << "Active Record tests: " << passed << "/" << total << " passed" << std::endl;
    return passed == total ? 0 : 1;
}
