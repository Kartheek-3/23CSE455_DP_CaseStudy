import sys
import time
from entity_modal_factory import ModalFactory


def run_tests():
    start = time.perf_counter()

    factory = ModalFactory()

    passed = 0
    total = 5

    # Test 1: Light modal
    m1 = factory.create_modal("light.kitchen")
    if m1.get_domain() == "light" and m1.render_action() == "RENDER_LIGHT_CONTROLS":
        passed += 1

    # Test 2: Switch modal
    m2 = factory.create_modal("switch.water_heater")
    if m2.get_domain() == "switch" and m2.render_action() == "RENDER_SWITCH_TOGGLE":
        passed += 1

    # Test 3: Sensor modal
    m3 = factory.create_modal("sensor.living_room_temp")
    if m3.get_domain() == "sensor" and m3.render_action() == "RENDER_SENSOR_GRAPH":
        passed += 1

    # Test 4: Climate modal
    m4 = factory.create_modal("climate.main_floor")
    if m4.get_domain() == "climate" and m4.render_action() == "RENDER_CLIMATE_HVAC":
        passed += 1

    # Test 5: Generic fallback modal
    m5 = factory.create_modal("unknown_domain.device_123")
    if (
        m5.get_domain() == "unknown_domain"
        and m5.render_action() == "RENDER_GENERIC_ATTRIBUTES"
    ):
        passed += 1

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    print(f"RESULT: {passed}/{total} passed")
    print(f"TIME_MS: {elapsed_ms:.3f}")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
