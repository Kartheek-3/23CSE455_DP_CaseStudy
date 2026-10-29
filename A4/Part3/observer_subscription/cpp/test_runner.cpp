#include "entity_observer.hpp"
#include <iostream>
#include <iomanip>
#include <windows.h>

class DashboardWidgetObserver : public EntitySubscriptionObserver {
public:
    int updateCount = 0;
    std::vector<std::string> receivedEntities;

    void onEntityUpdate(
        const std::string& entityId,
        const std::string& state,
        const std::map<std::string, std::string>& attributes
    ) override {
        updateCount++;
        receivedEntities.push_back(entityId);
    }
};

class NotificationLoggerObserver : public EntitySubscriptionObserver {
public:
    int updateCount = 0;
    std::vector<std::string> receivedEntities;

    void onEntityUpdate(
        const std::string& entityId,
        const std::string& state,
        const std::map<std::string, std::string>& attributes
    ) override {
        updateCount++;
        receivedEntities.push_back(entityId);
    }
};

int main() {
    LARGE_INTEGER freq, t1, t2;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&t1);

    EntityHub hub;
    DashboardWidgetObserver widget;
    NotificationLoggerObserver logger;

    hub.subscribe(&widget);
    hub.subscribe(&logger);

    int passed = 0;
    int total = 5;

    // Event 1
    std::map<std::string, std::string> attr1;
    attr1["brightness"] = "100";
    hub.updateEntity("light.living_room", "on", attr1);

    // Event 2
    std::map<std::string, std::string> attr2;
    attr2["temperature"] = "21.5";
    hub.updateEntity("climate.thermostat", "cool", attr2);

    // Event 3
    std::map<std::string, std::string> attr3;
    attr3["battery"] = "95";
    hub.updateEntity("sensor.smoke", "emergency", attr3);

    // Unsubscribe logger
    hub.unsubscribe(&logger);

    // Event 4
    std::map<std::string, std::string> attr4;
    attr4["brightness"] = "0";
    hub.updateEntity("light.kitchen", "off", attr4);

    // Check 1: DashboardWidget received 4 updates
    if (widget.updateCount == 4) passed++;

    // Check 2: Logger received 3 updates (none after unsubscribe)
    if (logger.updateCount == 3) passed++;

    // Check 3: State of light.living_room is on
    const auto* e1 = hub.getEntity("light.living_room");
    if (e1 && e1->getState() == "on") passed++;

    // Check 4: State of sensor.smoke is emergency
    const auto* e2 = hub.getEntity("sensor.smoke");
    if (e2 && e2->getState() == "emergency") passed++;

    // Check 5: Logger did not receive light.kitchen
    bool foundKitchen = false;
    for (const auto& id : logger.receivedEntities) {
        if (id == "light.kitchen") {
            foundKitchen = true;
            break;
        }
    }
    if (!foundKitchen) passed++;

    QueryPerformanceCounter(&t2);
    double elapsedMs = (t2.QuadPart - t1.QuadPart) * 1000.0 / freq.QuadPart;

    std::cout << "RESULT: " << passed << "/" << total << " passed\n";
    std::cout << "TIME_MS: " << std::fixed << std::setprecision(4) << elapsedMs << "\n";

    if (passed != total) return 1;
    return 0;
}
