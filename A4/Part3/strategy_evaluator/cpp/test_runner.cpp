#include "condition_strategy.hpp"
#include <iostream>
#include <iomanip>
#include <windows.h>

class CustomBatteryStrategy : public ConditionStrategy {
public:
    bool evaluate(
        const ConditionData& data,
        const std::map<std::string, std::string>& stateStore,
        const std::map<std::string, int>& context
    ) const override {
        auto it = stateStore.find("device.battery");
        if (it == stateStore.end()) return false;
        try {
            return std::stod(it->second) > 50.0;
        } catch (...) {
            return false;
        }
    }
};

int main() {
    LARGE_INTEGER freq, t1, t2;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&t1);

    EvaluatorContext context;

    std::map<std::string, std::string> stateStore;
    stateStore["light.patio"] = "on";
    stateStore["sensor.lux"] = "150.0";
    stateStore["device.battery"] = "85.0";

    std::map<std::string, int> envContext;
    envContext["screenWidth"] = 1024;

    int passed = 0;
    int total = 6;

    // Test 1: Strategy state (True)
    ConditionData cond1;
    cond1.type = "state";
    cond1.entity = "light.patio";
    cond1.expected = "on";
    if (context.evaluate(cond1, stateStore, envContext)) passed++;

    // Test 2: Strategy state (False)
    ConditionData cond2;
    cond2.type = "state";
    cond2.entity = "light.patio";
    cond2.expected = "off";
    if (!context.evaluate(cond2, stateStore, envContext)) passed++;

    // Test 3: Strategy numeric > 100 (True)
    ConditionData cond3;
    cond3.type = "numeric";
    cond3.entity = "sensor.lux";
    cond3.op = ">";
    cond3.threshold = 100.0;
    if (context.evaluate(cond3, stateStore, envContext)) passed++;

    // Test 4: Strategy numeric <= 20 (False)
    ConditionData cond4;
    cond4.type = "numeric";
    cond4.entity = "device.battery";
    cond4.op = "<=";
    cond4.threshold = 20.0;
    if (!context.evaluate(cond4, stateStore, envContext)) passed++;

    // Test 5: Strategy screen range 768-1200 (True)
    ConditionData cond5;
    cond5.type = "screen";
    cond5.minWidth = 768;
    cond5.maxWidth = 1200;
    if (context.evaluate(cond5, stateStore, envContext)) passed++;

    // Test 6: Custom pluggable strategy "battery_ok" (True)
    context.registerStrategy("battery_ok", std::make_shared<CustomBatteryStrategy>());
    ConditionData cond6;
    cond6.type = "battery_ok";
    if (context.evaluate(cond6, stateStore, envContext)) passed++;

    QueryPerformanceCounter(&t2);
    double elapsedMs = (t2.QuadPart - t1.QuadPart) * 1000.0 / freq.QuadPart;

    std::cout << "RESULT: " << passed << "/" << total << " passed\n";
    std::cout << "TIME_MS: " << std::fixed << std::setprecision(4) << elapsedMs << "\n";

    if (passed != total) return 1;
    return 0;
}
