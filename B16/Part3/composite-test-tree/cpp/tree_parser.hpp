// Builds the tree from an indented text file (two spaces per level).
#pragma once

#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include "nodes.hpp"

class TreeFormatError : public std::runtime_error {
public:
    explicit TreeFormatError(const std::string& message) : std::runtime_error(message) {}
    TreeFormatError(int line_number, const std::string& message)
        : std::runtime_error("line " + std::to_string(line_number) + ": " + message) {}
};

// Returns the engine node; the caller owns the whole tree through it.
std::unique_ptr<TestContainer> parse(const std::vector<std::string>& lines);

// Reads a text file into lines (throws std::runtime_error if it cannot be opened).
std::vector<std::string> read_lines(const std::string& path);

// Reads the tree, removes the tests with the tag, prunes empty containers and returns the output.
std::string report(const std::string& tree_path, const std::string& tag);
