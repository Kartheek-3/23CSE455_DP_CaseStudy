# coding=utf-8
"""Helpers shared by the case-study tests."""
import time

# Stored custom options of a bang-bang Function as the web UI saves them (JSON format)
BANG_BANG_OPTIONS = {
    "measurement": "meas-dev,meas-id",
    "measurement_max_age": 360,
    "output": "out-dev,out-meas,out-chan",
    "setpoint": 50,
    "hysteresis": 1,
    "direction": "raise",
    "update_period": 5,
}


def run_loop(module, value, output_state='off'):
    """Run one loop() iteration with the given last measurement value and output state."""
    module.get_last_measurement.return_value = [1700000000.0, value]
    module.control.output_state.return_value = output_state
    module.timer_loop = time.time() - 0.001  # update period has elapsed
    module.loop()
    return module.control
