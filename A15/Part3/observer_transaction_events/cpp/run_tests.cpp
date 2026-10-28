#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string execute(const std::string& script) {
    EventPublisher publisher; AuditLog audit; HighValueAlert alert;
    publisher.subscribe(&audit); publisher.subscribe(&alert);
    AccountService svc(publisher);
    std::string out; std::stringstream cmds(script); std::string cmd;
    while (std::getline(cmds, cmd, ';')) {
        std::stringstream ts(cmd); std::string name, a, b; ts >> name >> a >> b;
        try {
            if (name == "deposit") { svc.deposit(std::stol(a), std::stod(b)); out = "ok"; }
            else if (name == "withdraw") { svc.withdraw(std::stol(a), std::stod(b)); out = "ok"; }
            else if (name == "audit") out = audit.text(std::stol(a));
            else out = alert.text();
        } catch (const BadRequest&) { out = "BAD_REQUEST"; }
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
