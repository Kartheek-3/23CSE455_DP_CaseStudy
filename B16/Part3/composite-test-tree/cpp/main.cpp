// Command-line entry point: ./composite <tree-file> <tag>
#include <iostream>

#include "tree_parser.hpp"

int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "usage: ./composite <tree-file> <tag>\n";
        return 2;
    }
    try {
        std::cout << report(argv[1], argv[2]);
    } catch (const std::runtime_error& e) {
        std::cerr << "error: " << e.what() << '\n';
        return 1;
    }
    return 0;
}
