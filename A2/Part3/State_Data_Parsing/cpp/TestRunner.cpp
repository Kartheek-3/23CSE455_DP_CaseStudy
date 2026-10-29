#include <cassert>
#include <iostream>
#include "state_parser_strategy.cpp"

int main() {
    StateServer server(std::make_unique<AlertParser>());
    assert(server.process("sample-data") == "Parsed alert: sample-data");
    std::cout << "PASS: Alert parser strategy delegation\n";
}
