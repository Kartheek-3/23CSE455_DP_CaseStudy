#include <cstdio>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string fmt(double v) { char b[64]; std::snprintf(b, sizeof b, "%.2f", v); return b; }

static std::string execute(const std::string& script) {
    AccountScripts scripts;
    std::string out; std::stringstream cmds(script); std::string cmd;
    while (std::getline(cmds, cmd, ';')) {
        std::stringstream ts(cmd); std::string name, a, b; ts >> name >> a >> b;
        try {
            if (name == "open") out = std::to_string(scripts.open(a, std::stod(b)));
            else if (name == "deposit") out = fmt(scripts.deposit(std::stol(a), std::stod(b)));
            else out = fmt(scripts.withdraw(std::stol(a), std::stod(b)));
        } catch (const BadRequest&) { out = "BAD_REQUEST"; }
        catch (const NotFound&) { out = "NOT_FOUND"; }
    }
    return out;
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
