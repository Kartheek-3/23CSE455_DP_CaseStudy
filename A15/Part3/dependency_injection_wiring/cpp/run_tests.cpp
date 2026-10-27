#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string execute(const std::string& script) {
    Service service; RealDao real; FakeDao fake; Container c;
    c.registerBean("Service", &service);
    std::string out; std::stringstream cmds(script); std::string cmd;
    while (std::getline(cmds, cmd, ';')) {
        std::stringstream ts(cmd); std::string name, arg; ts >> name >> arg;
        try {
            if (name == "register") { c.registerBean("Dao", arg == "real" ? static_cast<Bean*>(&real) : &fake); out = "registered"; }
            else if (name == "wire") { c.wire(); out = "wired"; }
            else out = static_cast<Service*>(c.get("Service"))->describe();
        } catch (const MissingDependency& e) { out = std::string("MISSING:") + e.what(); }
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
