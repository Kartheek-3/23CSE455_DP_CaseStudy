// Runs fixtures S1-S8 from Part3/test-cases/strategy_spec.md.
#include <iostream>
#include <string>
#include <vector>
#include "ride_fare.hpp"

struct Case {
    std::string id;
    Trip trip;
    std::string expected;
};

int main() {
    const std::vector<Case> cases = {
        {"S1", {"ONE_WAY", 30, 0, 0}, "450"},
        {"S2", {"ONE_WAY", 60, 0, 0}, "600"},
        {"S3", {"ROUND_TRIP", 0, 3, 0}, "3000"},
        {"S4", {"HOURLY", 0, 0, 3}, "800"},
        {"S5", {"HOURLY", 0, 0, 5.5}, "1200"},
        {"S6", {"OUTSTATION", 200, 2, 0}, "3000"},
        {"S7", {"ONE_WAY", 0, 0, 0}, "error INVALID_INPUT"},
        {"S8", {"SHUTTLE", 10, 0, 0}, "error UNKNOWN_RIDE_TYPE"},
    };
    int passed = 0;
    for (const auto& c : cases) {
        std::string actual;
        try {
            actual = std::to_string(FareCalculator().calculate(c.trip));
        } catch (const FareError& e) {
            actual = "error " + e.code;
        }
        if (actual == c.expected) {
            ++passed;
            std::cout << "PASS " << c.id << "\n";
        } else {
            std::cout << "FAIL " << c.id << ": expected " << c.expected << ", got " << actual << "\n";
        }
    }
    std::cout << "RESULT " << passed << "/" << cases.size() << " passed\n";
    return passed == static_cast<int>(cases.size()) ? 0 : 1;
}
