# coding=utf-8
"""CH01 demo - crop profiles drive the bang-bang irrigation controller.

Runs the real mycodo.functions.bang_bang.CustomModule from Part2/code with the
settings database and the daemon replaced by in-memory fakes, feeds it a series
of soil-moisture readings and prints the pump decision for each reading.

Run from the team folder:  python Part2/changes/Change1/demo.py
"""
import importlib
import json
import logging
import os
import sys
import time
import types
from unittest import mock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'code')))
for _name in ('grp', 'pwd'):  # POSIX-only stdlib modules, absent on Windows
    try:
        importlib.import_module(_name)
    except ImportError:
        sys.modules[_name] = types.ModuleType(_name)
logging.basicConfig(stream=sys.stdout, format="    [log %(levelname)s] %(message)s")
logging.getLogger().handlers[0].setLevel(logging.ERROR)  # show only errors from the controller

from mycodo.functions import bang_bang  # noqa: E402
from mycodo.utils.crop_profiles import (CropProfile, crop_profile_choices,  # noqa: E402
                                        get_crop_profile, register_crop_profile)


class FakeDaemon:
    """Stands in for DaemonControl: keeps the pump state and records the last command."""
    def __init__(self):
        self.state, self.command = 'off', None

    def output_state(self, output_id, channel):
        return self.state

    def output_on(self, output_id, output_channel=None):
        self.state, self.command = 'on', 'PUMP ON '

    def output_off(self, output_id, output_channel=None):
        self.state, self.command = 'off', 'PUMP OFF'


def build_controller(crop, setpoint=50, hysteresis=1):
    options = {"measurement": "soil-sensor,moisture", "measurement_max_age": 360,
               "output": "pump,pump-meas,pump-chan", "setpoint": setpoint, "hysteresis": hysteresis,
               "direction": "raise", "update_period": 5, "crop_profile": crop}
    row = mock.Mock(unique_id='demo-0001', log_level_debug=False, custom_options=json.dumps(options))
    db = mock.MagicMock()
    db.return_value.filter.return_value.all.return_value = []
    db.return_value.filter.return_value.first.return_value = mock.Mock(channel=0)
    with mock.patch.object(bang_bang, 'db_retrieve_table_daemon', return_value=row), \
            mock.patch('mycodo.abstract_base_controller.db_retrieve_table_daemon', db), \
            mock.patch.object(bang_bang, 'DaemonControl', FakeDaemon):
        return bang_bang.CustomModule(row)


def simulate(crop, readings, **kwargs):
    controller = build_controller(crop, **kwargs)
    print(f"\n=== Crop profile {crop!r}: setpoint {controller.setpoint} %, hysteresis {controller.hysteresis} %"
          f"  (irrigate below {controller.setpoint - controller.hysteresis} %,"
          f" stop above {controller.setpoint + controller.hysteresis} %)")
    for moisture in readings:
        controller.control.command = None
        controller.get_last_measurement = lambda *a, m=moisture, **k: [time.time(), m]
        controller.timer_loop = time.time() - 0.001
        controller.loop()
        print(f"  soil moisture {moisture:5.1f} %  ->  {controller.control.command or '(no change)':12s}"
              f" pump is {controller.control.state.upper()}")


print("Registered crop types:")
for crop_id, _name in crop_profile_choices():
    p = get_crop_profile(crop_id)
    print(f"  {p.name:7s} ({p.name_unique}) target {p.target_moisture:5.1f} %  tolerance +/-{p.tolerance} %")

readings = [72, 66, 61, 58, 63, 69, 71, 80, 88, 91]
for crop in ('tomato', 'rice', 'wheat'):
    simulate(crop, readings)

print("\n--- A developer adds a new crop type in one place: register_crop_profile(CropProfile('lettuce', ...))")
register_crop_profile(CropProfile('lettuce', 'Lettuce', target_moisture=70.0, tolerance=4.0))
simulate('lettuce', [75, 68, 65, 70, 75])

print("\n--- Error case: unknown crop 'banana' stored in the configuration -> configured values are kept")
simulate('banana', [48, 52], setpoint=50, hysteresis=1)
