#include <iostream>

#include "template.hpp"

int main(int argc, char** argv) {
    if (argc != 2) {
        std::cerr << "usage: ./template <tests-file>\n";
        return 2;
    }
    try {
        std::cout << report(argv[1]);
    } catch (const std::exception& error) {
        std::cerr << "error: " << error.what() << "\n";
        return 1;
    }
    return 0;
}
