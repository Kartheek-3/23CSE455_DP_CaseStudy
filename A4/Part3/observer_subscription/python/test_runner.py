import sys
import time
from typing import Any, Dict, List
from entity_observer import EntitySubscriptionObserver, EntityHub


class DashboardWidgetObserver(EntitySubscriptionObserver):
    def __init__(self):
        self.update_count = 0
        self.received_entities: List[str] = []

    def on_entity_update(
        self, entity_id: str, state: str, attributes: Dict[str, Any]
    ) -> None:
        self.update_count += 1
        self.received_entities.append(entity_id)


class NotificationLoggerObserver(EntitySubscriptionObserver):
    def __init__(self):
        self.update_count = 0
        self.received_entities: List[str] = []

    def on_entity_update(
        self, entity_id: str, state: str, attributes: Dict[str, Any]
    ) -> None:
        self.update_count += 1
        self.received_entities.append(entity_id)


def run_tests():
    start = time.perf_counter()

    hub = EntityHub()
    widget = DashboardWidgetObserver()
    logger = NotificationLoggerObserver()

    hub.subscribe(widget)
    hub.subscribe(logger)

    passed = 0
    total = 5

    # Event 1
    hub.update_entity("light.living_room", "on", {"brightness": "100"})

    # Event 2
    hub.update_entity("climate.thermostat", "cool", {"temperature": "21.5"})

    # Event 3
    hub.update_entity("sensor.smoke", "emergency", {"battery": "95"})

    # Unsubscribe logger
    hub.unsubscribe(logger)

    # Event 4
    hub.update_entity("light.kitchen", "off", {"brightness": "0"})

    # Check 1: DashboardWidget received 4 updates
    if widget.update_count == 4:
        passed += 1

    # Check 2: Logger received 3 updates (none after unsubscribe)
    if logger.update_count == 3:
        passed += 1

    # Check 3: State of light.living_room is on
    e1 = hub.get_entity("light.living_room")
    if e1 is not None and e1.state == "on":
        passed += 1

    # Check 4: State of sensor.smoke is emergency
    e2 = hub.get_entity("sensor.smoke")
    if e2 is not None and e2.state == "emergency":
        passed += 1

    # Check 5: Logger did not receive light.kitchen
    if "light.kitchen" not in logger.received_entities:
        passed += 1

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    print(f"RESULT: {passed}/{total} passed")
    print(f"TIME_MS: {elapsed_ms:.3f}")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
