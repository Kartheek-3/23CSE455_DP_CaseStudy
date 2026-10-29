# coding=utf-8
"""CH02 demo - irrigation strategies of the bang-bang irrigation controller.

Runs the real mycodo.functions.bang_bang.CustomModule from Part2/code (settings
database and daemon replaced by in-memory fakes). The same simulated day of
soil-moisture readings and a rain indicator is fed to three controllers that
differ only in their irrigation strategy; the pump decisions are printed side by side.

Run from the team folder:  python Part2/changes/Change2/demo.py
"""
import datetime
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
logging.getLogger().handlers[0].setLevel(logging.WARNING)

from mycodo.functions import bang_bang  # noqa: E402


class FakeDaemon:
    """Stands in for DaemonControl: keeps the pump state and records the last command."""
    def __init__(self):
        self.state, self.command = 'off', None

    def output_state(self, output_id, channel):
        return self.state

    def output_on(self, output_id, output_channel=None):
        self.state, self.command = 'on', 'ON'

    def output_off(self, output_id, output_channel=None):
        self.state, self.command = 'off', 'OFF'


def build_controller(**options):
    stored = {"measurement": "soil-sensor,moisture", "measurement_max_age": 360,
              "output": "pump,pump-meas,pump-chan", "direction": "raise", "update_period": 5,
              "setpoint": 50, "hysteresis": 1,
              "crop_profile": "tomato", "rain_measurement": "weather,rain-probability",
              "rain_threshold": 60, "irrigation_windows": "05:00-09:00,18:00-21:00"}
    stored.update(options)
    row = mock.Mock(unique_id='demo-0002', log_level_debug=False, custom_options=json.dumps(stored))
    db = mock.MagicMock()
    db.return_value.filter.return_value.all.return_value = []
    db.return_value.filter.return_value.first.return_value = mock.Mock(channel=0)
    with mock.patch.object(bang_bang, 'db_retrieve_table_daemon', return_value=row), \
            mock.patch('mycodo.abstract_base_controller.db_retrieve_table_daemon', db), \
            mock.patch.object(bang_bang, 'DaemonControl', FakeDaemon):
        return bang_bang.CustomModule(row)


def step(controller, at, moisture, rain):
    controller._now = lambda: datetime.datetime(2024, 6, 1, *at)
    controller.get_last_measurement = (
        lambda device, measurement, max_age=None: [time.time(), rain if device == 'weather' else moisture])
    controller.control.command = None
    controller.timer_loop = time.time() - 0.001
    controller.loop()
    return f"{controller.control.command or '-':3s} ({controller.control.state})"


# (time of day, soil moisture %, rain probability %)
DAY = [((4, 0), 58, 10), ((6, 0), 57, 10), ((7, 0), 64, 10), ((8, 0), 71, 10),
       ((11, 0), 63, 20), ((13, 0), 57, 30), ((15, 0), 55, 75), ((17, 0), 54, 80),
       ((18, 30), 54, 85), ((19, 30), 54, 30), ((20, 30), 66, 20), ((22, 0), 72, 10)]

controllers = {
    'hysteresis': build_controller(irrigation_strategy='hysteresis'),
    'time_window': build_controller(irrigation_strategy='time_window'),
    'skip_if_rain': build_controller(irrigation_strategy='skip_if_rain'),
}
print("Crop profile 'tomato': irrigate below 60 %, stop above 70 %")
print("time_window: 05:00-09:00,18:00-21:00   skip_if_rain: rain probability >= 60 %")
for name, c in controllers.items():
    print(f"  {name:13s} -> {type(c.strategy).__name__}"
          + (f"({type(c.strategy.inner).__name__})" if hasattr(c.strategy, 'inner') else ''))
print()
print(f"{'time':5s} {'soil %':>6s} {'rain %':>6s} | " + " | ".join(f"{n:13s}" for n in controllers))
print("-" * 65)
for at, moisture, rain in DAY:
    cells = [f"{step(c, at, moisture, rain):13s}" for c in controllers.values()]
    print(f"{at[0]:02d}:{at[1]:02d} {moisture:6.0f} {rain:6.0f} | " + " | ".join(cells))
print("\ncommand sent (pump state afterwards); '-' = no command")

print("\n--- Error case: time_window with invalid windows 'abc' -> logged, falls back to hysteresis")
fallback = build_controller(irrigation_strategy='time_window', irrigation_windows='abc')
print(f"  strategy in use: {type(fallback.strategy).__name__}")
