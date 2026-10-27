#include "TrainerAssignmentStrategy.hpp"
#include <cassert>
#include <iostream>

int main() {
    const std::vector<Trainer> trainers = {
        {"Asha", "Weight Loss", 3, 10, 4.8, true},
        {"Ravi", "Muscle Gain", 1, 10, 4.5, true},
        {"Maya", "Weight Loss", 5, 10, 4.9, true},
        {"John", "General Fitness", 0, 10, 5.0, false}
    };

    TrainerAssignmentService service(std::make_unique<SpecializationMatchPolicy>());
    assert(service.assign(trainers, "Weight Loss")->name == "Maya");

    service.setPolicy(std::make_unique<LeastLoadedPolicy>());
    assert(service.assign(trainers, "Any Goal")->name == "Ravi");

    service.setPolicy(std::make_unique<HighestRatedPolicy>());
    assert(service.assign(trainers, "Any Goal")->name == "Maya");

    const std::vector<Trainer> full = {{"Full", "Any", 2, 2, 5.0, true}};
    assert(service.assign(full, "Any") == nullptr);

    std::cout << "All TrainerAssignmentStrategy tests passed.\\n";
    return 0;
}
