#include "entity_modal_factory.hpp"
#include <iostream>
#include <iomanip>
#include <windows.h>

int main() {
    LARGE_INTEGER freq, t1, t2;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&t1);

    ModalFactory factory;

    int passed = 0;
    int total = 5;

    // Test 1: Light modal
    auto m1 = factory.createModal("light.kitchen");
    if (m1->getDomain() == "light" && m1->renderAction() == "RENDER_LIGHT_CONTROLS") passed++;

    // Test 2: Switch modal
    auto m2 = factory.createModal("switch.water_heater");
    if (m2->getDomain() == "switch" && m2->renderAction() == "RENDER_SWITCH_TOGGLE") passed++;

    // Test 3: Sensor modal
    auto m3 = factory.createModal("sensor.living_room_temp");
    if (m3->getDomain() == "sensor" && m3->renderAction() == "RENDER_SENSOR_GRAPH") passed++;

    // Test 4: Climate modal
    auto m4 = factory.createModal("climate.main_floor");
    if (m4->getDomain() == "climate" && m4->renderAction() == "RENDER_CLIMATE_HVAC") passed++;

    // Test 5: Generic fallback modal
    auto m5 = factory.createModal("unknown_domain.device_123");
    if (m5->getDomain() == "unknown_domain" && m5->renderAction() == "RENDER_GENERIC_ATTRIBUTES") passed++;

    QueryPerformanceCounter(&t2);
    double elapsedMs = (t2.QuadPart - t1.QuadPart) * 1000.0 / freq.QuadPart;

    std::cout << "RESULT: " << passed << "/" << total << " passed\n";
    std::cout << "TIME_MS: " << std::fixed << std::setprecision(4) << elapsedMs << "\n";

    if (passed != total) return 1;
    return 0;
}
