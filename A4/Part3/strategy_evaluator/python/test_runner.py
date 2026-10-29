import sys
import time
from condition_strategy import EvaluatorContext


def run_tests():
    start = time.perf_counter()

    context = EvaluatorContext()

    state_store = {
        "light.patio": "on",
        "sensor.lux": 150.0,
        "device.battery": 85.0,
    }
    env_context = {"screenWidth": 1024}

    passed = 0
    total = 6

    # Test 1: Strategy state (True)
    cond1 = {"type": "state", "entity": "light.patio", "expected": "on"}
    if context.evaluate(cond1, state_store, env_context):
        passed += 1

    # Test 2: Strategy state (False)
    cond2 = {"type": "state", "entity": "light.patio", "expected": "off"}
    if not context.evaluate(cond2, state_store, env_context):
        passed += 1

    # Test 3: Strategy numeric > 100 (True)
    cond3 = {
        "type": "numeric",
        "entity": "sensor.lux",
        "op": ">",
        "threshold": 100.0,
    }
    if context.evaluate(cond3, state_store, env_context):
        passed += 1

    # Test 4: Strategy numeric <= 20 (False)
    cond4 = {
        "type": "numeric",
        "entity": "device.battery",
        "op": "<=",
        "threshold": 20.0,
    }
    if not context.evaluate(cond4, state_store, env_context):
        passed += 1

    # Test 5: Strategy screen range 768-1200 (True)
    cond5 = {"type": "screen", "minWidth": 768, "maxWidth": 1200}
    if context.evaluate(cond5, state_store, env_context):
        passed += 1

    # Test 6: Custom pluggable strategy "battery_ok" (True)
    def battery_eval(data, states, env):
        b = states.get("device.battery")
        return b is not None and float(b) > 50.0

    context.register("battery_ok", battery_eval)
    cond6 = {"type": "battery_ok"}
    if context.evaluate(cond6, state_store, env_context):
        passed += 1

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    print(f"RESULT: {passed}/{total} passed")
    print(f"TIME_MS: {elapsed_ms:.3f}")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
