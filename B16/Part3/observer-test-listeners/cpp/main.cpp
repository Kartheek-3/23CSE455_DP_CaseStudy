// Command-line entry point: ./observer <events-file>
#include <iostream>

#include "runner.hpp"

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "usage: ./observer <events-file>\n";
        return 2;
    }
    try {
        std::cout << report(argv[1]);
    } catch (const std::runtime_error& e) {
        std::cerr << "error: " << e.what() << '\n';
        return 1;
    }
    return 0;
}
