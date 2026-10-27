#include "condition_composite.hpp"
#include <iostream>
#include <iomanip>
#include <windows.h>

int main() {
    LARGE_INTEGER freq, t1, t2;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&t1);

    std::map<std::string, std::string> stateStore;
    stateStore["light.living_room"] = "on";
    stateStore["climate.ac"] = "cool";
    stateStore["sensor.temperature"] = "24.5";
    stateStore["binary_sensor.motion"] = "off";

    int passed = 0;
    int total = 6;

    // Test 1: Leaf State Condition (True)
    StateCondition c1("light.living_room", "on");
    if (c1.evaluate(stateStore)) passed++;

    // Test 2: Leaf Numeric Condition (False)
    NumericStateCondition c2("sensor.temperature", ">", 30.0);
    if (!c2.evaluate(stateStore)) passed++;

    // Test 3: Composite AND (True)
    AndCondition c3;
    c3.add(std::make_shared<StateCondition>("light.living_room", "on"));
    c3.add(std::make_shared<NumericStateCondition>("sensor.temperature", ">=", 20.0));
    if (c3.evaluate(stateStore)) passed++;

    // Test 4: Composite OR (False)
    OrCondition c4;
    c4.add(std::make_shared<NumericStateCondition>("sensor.temperature", "<", 20.0));
    c4.add(std::make_shared<StateCondition>("binary_sensor.motion", "on"));
    if (!c4.evaluate(stateStore)) passed++;

    // Test 5: Composite NOT (True)
    NotCondition c5(std::make_shared<StateCondition>("binary_sensor.motion", "on"));
    if (c5.evaluate(stateStore)) passed++;

    // Test 6: Nested Composite AND(state, OR(numeric, NOT(state))) (True)
    AndCondition c6;
    auto orBranch = std::make_shared<OrCondition>();
    orBranch->add(std::make_shared<NumericStateCondition>("sensor.temperature", ">", 25.0));
    orBranch->add(std::make_shared<NotCondition>(std::make_shared<StateCondition>("binary_sensor.motion", "on")));
    c6.add(std::make_shared<StateCondition>("light.living_room", "on"));
    c6.add(orBranch);
    if (c6.evaluate(stateStore)) passed++;

    QueryPerformanceCounter(&t2);
    double elapsedMs = (t2.QuadPart - t1.QuadPart) * 1000.0 / freq.QuadPart;

    std::cout << "RESULT: " << passed << "/" << total << " passed\n";
    std::cout << "TIME_MS: " << std::fixed << std::setprecision(4) << elapsedMs << "\n";

    if (passed != total) return 1;
    return 0;
}
