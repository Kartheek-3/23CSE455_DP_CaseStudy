#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string execute(const std::string& script) {
    AccountService svc;
    std::stringstream ts(script); std::string cmd, arg; ts >> cmd >> arg;
    if (cmd == "deposit") return translate([&] { return svc.deposit(std::stod(arg)); });
    if (cmd == "find") return translate([&] { return svc.find(std::stol(arg)); });
    return translate([&] { return svc.boom(); });
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
