#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "snippet.hpp"

static std::string execute(const std::string& script) {
    std::stringstream ts(script); std::string cmd, name, phone, address; int age;
    ts >> cmd >> name >> age >> phone >> address;
    UserAssembler asm_;
    if (cmd == "toDto") return asm_.toDto(User{7, name, age, phone, address}).text();
    UserDto dto{name, age, phone, address};
    if (cmd == "toEntity") return asm_.toEntity(dto).text();
    return asm_.toDto(asm_.toEntity(dto)).text();
}

int main(int, char** argv) {
    std::ifstream in(argv[1]); std::string line; int passed = 0, total = 0;
    while (std::getline(in, line)) {
        if (line.empty() || line[0] == '#') continue;
        auto i = line.find(" => ");
        std::string expected = line.substr(i + 4), got = execute(line.substr(0, i));
        ++total;
        if (got == expected) { ++passed; std::cout << "PASS case" << total << "\n"; }
        else std::cout << "FAIL case" << total << " expected=" << expected << " got=" << got << "\n";
    }
    std::cout << "RESULT passed=" << passed << " total=" << total << "\n";
    return passed == total ? 0 : 1;
}
