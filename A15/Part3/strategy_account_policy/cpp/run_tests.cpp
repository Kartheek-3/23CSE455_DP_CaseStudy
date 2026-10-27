#include <cstdio>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string fmt(double v) { char b[64]; std::snprintf(b, sizeof b, "%.2f", v); return b; }

static std::string execute(const std::string& script) {
    std::stringstream ts(script); std::string kind, op; double balance, amount;
    ts >> kind >> op >> balance >> amount;
    try {
        Account account(balance, PolicyResolver().forType(kind));
        if (op == "deposit") { account.deposit(amount); return fmt(account.balance); }
        return account.withdraw(amount) ? "ALLOWED" : "DENIED";
    } catch (const NoPolicy&) { return "NO_POLICY"; }
}

int main(int, char** argv) {
    std::ifstream in(argv[1]); std::string line; int passed = 0, total = 0;
    while (std::getline(in, line)) {
        if (line.empty() || line[0] == (char)35) continue;
        auto i = line.find(" => ");
        std::string expected = line.substr(i + 4), got = execute(line.substr(0, i));
        ++total;
        if (got == expected) { ++passed; std::cout << "PASS case" << total << "\n"; }
        else std::cout << "FAIL case" << total << " expected=" << expected << " got=" << got << "\n";
    }
    std::cout << "RESULT passed=" << passed << " total=" << total << "\n";
    return passed == total ? 0 : 1;
}
