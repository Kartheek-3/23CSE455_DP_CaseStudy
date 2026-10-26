#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

#include "slot_allocation_strategy.hpp"

// Test runner for the Strategy cross-language snippet (C++).

int passed = 0;
int total = 0;

void checkId(const std::string& label, const Slot* slot, int expectedId) {
    total++;
    int actual = (slot == nullptr) ? -1 : slot->id;
    if (actual != expectedId) {
        throw std::runtime_error(label + ": expected " + std::to_string(expectedId) +
                                 " got " + std::to_string(actual));
    }
    passed++;
}

int main() {
    std::vector<Slot> slots = {
        Slot(1, "A1", 2, "standard", 50),
        Slot(2, "A2", 1, "standard", 30),
        Slot(3, "E1", 1, "ev", 40),
    };
    std::vector<Slot> noEv = {slots[0], slots[1]};

    FirstAvailableStrategy first;
    NearestToEntranceStrategy nearest;
    EvPreferredStrategy evPref;
    SlotAllocator allocator(&first);

    checkId("first-available", allocator.allocate(slots), 1);
    allocator.setStrategy(&nearest);
    checkId("nearest-to-entrance", allocator.allocate(slots), 2);
    allocator.setStrategy(&evPref);
    checkId("ev-preferred", allocator.allocate(slots), 3);
    checkId("ev-preferred-no-ev", allocator.allocate(noEv), 2);
    checkId("empty", allocator.allocate({}), -1);

    std::cout << "STRATEGY_CPP PASS " << passed << "/" << total << std::endl;
    return 0;
}
