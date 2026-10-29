#include <cstdio>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string fmt(double v) { char b[64]; std::snprintf(b, sizeof b, "%.2f", v); return b; }

struct Recorder : BankApi {                     // test double standing in for the service layer
    std::vector<std::string> log;
    void create(long u, const std::string& k, double b) override { log.push_back("create(" + std::to_string(u) + "," + k + "," + fmt(b) + ")"); }
    void deposit(long a, double m) override { log.push_back("deposit(" + std::to_string(a) + "," + fmt(m) + ")"); }
    void withdraw(long a, double m) override { log.push_back("withdraw(" + std::to_string(a) + "," + fmt(m) + ")"); }
    std::vector<long> listAll() override { log.push_back("list()"); return {1, 2, 3}; }
};

static std::string execute(const std::string& script) {
    Recorder rec; AccountController ctl(rec);
    std::stringstream ts(script); std::string cmd, a, b, c; ts >> cmd >> a >> b >> c;
    Response r{};
    if (cmd == "create") r = ctl.create(std::stol(a), b, std::stod(c));
    else if (cmd == "deposit") r = ctl.deposit(std::stol(a), std::stod(b));
    else if (cmd == "withdraw") r = ctl.withdraw(std::stol(a), std::stod(b));
    else r = ctl.list();
    std::string joined;
    for (size_t i = 0; i < rec.log.size(); ++i) joined += (i ? "," : "") + rec.log[i];
    return joined + "|" + std::to_string(r.status) + " " + r.message;
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
