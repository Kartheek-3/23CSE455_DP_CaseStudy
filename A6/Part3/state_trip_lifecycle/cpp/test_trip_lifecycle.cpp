// Runs fixtures T1-T8 from Part3/test-cases/state_spec.md.
#include <iostream>
#include <string>
#include <vector>
#include "trip_lifecycle.hpp"

struct Case {
    std::string id;
    std::vector<std::string> events;
    std::string expectedState;
    int expectedErrors;
};

int main() {
    const std::vector<Case> cases = {
        {"T1", {"accept", "complete"}, "COMPLETED", 0},
        {"T2", {"cancel"}, "CANCELLED", 0},
        {"T3", {"accept", "cancel"}, "CANCELLED", 0},
        {"T4", {"expire"}, "EXPIRED", 0},
        {"T5", {"complete"}, "PENDING", 1},
        {"T6", {"accept", "complete", "cancel"}, "COMPLETED", 1},
        {"T7", {"accept", "reject"}, "REJECTED", 0},
        {"T8", {"expire", "accept", "cancel"}, "EXPIRED", 2},
    };
    int passed = 0;
    for (const auto& c : cases) {
        Trip trip;
        int errors = 0;
        for (const auto& e : c.events) {
            try {
                trip.apply(e);
            } catch (const InvalidTransition&) {
                ++errors;
            }
        }
        if (trip.status() == c.expectedState && errors == c.expectedErrors) {
            ++passed;
            std::cout << "PASS " << c.id << "\n";
        } else {
            std::cout << "FAIL " << c.id << ": got " << trip.status() << "/" << errors << "\n";
        }
    }
    std::cout << "RESULT " << passed << "/" << cases.size() << " passed\n";
    return passed == static_cast<int>(cases.size()) ? 0 : 1;
}
