#include <iostream>
#include <stdexcept>
#include <string>

#include "ev_charging_state.hpp"

// Test runner for the State cross-language snippet (C++).

int passed = 0;
int total = 0;

void check(const std::string& label, const std::string& actual, const std::string& expected) {
    total++;
    if (actual != expected) {
        throw std::runtime_error(label + ": expected " + expected + " got " + actual);
    }
    passed++;
}

int main() {
    ChargingSession session;

    check("initial", session.state(), "idle");
    check("startCharge-invalid", session.startCharge(), "error");
    check("state-unchanged", session.state(), "idle");
    std::string errors;
    for (std::size_t i = 0; i < session.errors.size(); ++i) {
        if (i > 0) {
            errors += ",";
        }
        errors += session.errors[i];
    }
    check("errors", errors, "startCharge@idle");
    check("plugIn", session.plugIn(), "plugged_in");
    check("state-plugged", session.state(), "plugged_in");
    check("removeCable-back", session.removeCable(), "idle");

    session.plugIn();
    check("startCharge", session.startCharge(), "charging");
    check("state-charging", session.state(), "charging");
    check("removeCable-invalid", session.removeCable(), "error");
    check("finishCharge", session.finishCharge(), "completed");
    check("state-completed", session.state(), "completed");
    check("removeCable-done", session.removeCable(), "idle");

    std::cout << "STATE_CPP PASS " << passed << "/" << total << std::endl;
    return 0;
}
