import sys
import time
from condition_composite import (
    StateCondition,
    NumericStateCondition,
    AndCondition,
    OrCondition,
    NotCondition,
)


def run_tests():
    start = time.perf_counter()

    state_store = {
        "light.living_room": "on",
        "climate.ac": "cool",
        "sensor.temperature": 24.5,
        "binary_sensor.motion": "off",
    }

    passed = 0
    total = 6

    # Test 1: Leaf State Condition (True)
    c1 = StateCondition("light.living_room", "on")
    if c1.evaluate(state_store):
        passed += 1

    # Test 2: Leaf Numeric Condition (False)
    c2 = NumericStateCondition("sensor.temperature", ">", 30.0)
    if not c2.evaluate(state_store):
        passed += 1

    # Test 3: Composite AND (True)
    c3 = AndCondition().add(StateCondition("light.living_room", "on")).add(
        NumericStateCondition("sensor.temperature", ">=", 20.0)
    )
    if c3.evaluate(state_store):
        passed += 1

    # Test 4: Composite OR (False)
    c4 = OrCondition().add(
        NumericStateCondition("sensor.temperature", "<", 20.0)
    ).add(StateCondition("binary_sensor.motion", "on"))
    if not c4.evaluate(state_store):
        passed += 1

    # Test 5: Composite NOT (True)
    c5 = NotCondition(StateCondition("binary_sensor.motion", "on"))
    if c5.evaluate(state_store):
        passed += 1

    # Test 6: Nested Composite AND(state, OR(numeric, NOT(state))) (True)
    or_branch = OrCondition().add(
        NumericStateCondition("sensor.temperature", ">", 25.0)
    ).add(NotCondition(StateCondition("binary_sensor.motion", "on")))
    c6 = AndCondition().add(StateCondition("light.living_room", "on")).add(or_branch)
    if c6.evaluate(state_store):
        passed += 1

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    print(f"RESULT: {passed}/{total} passed")
    print(f"TIME_MS: {elapsed_ms:.3f}")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
