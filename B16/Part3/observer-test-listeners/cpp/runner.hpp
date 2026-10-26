// The subject: reads events line by line and pushes each one to its listener.
#pragma once

#include <stdexcept>
#include <string>
#include <vector>

#include "listeners.hpp"

class EventFormatError : public std::runtime_error {
public:
    EventFormatError(int line_number, const std::string& message)
        : std::runtime_error("line " + std::to_string(line_number) + ": " + message) {}
};

class EventRunner {
public:
    // The runner only borrows the listener; whoever calls run() keeps it alive.
    explicit EventRunner(TestExecutionListener& listener) : listener_(listener) {}

    void run(const std::vector<std::string>& lines);

private:
    void dispatch(int line_number, const std::string& line);

    TestExecutionListener& listener_;
};

// Reads a text file into lines (throws std::runtime_error if it cannot be opened).
std::vector<std::string> read_lines(const std::string& path);

// Wires the three listeners to the runner and returns the summary, the log and the failures.
std::string report(const std::string& events_path);
