# coding=utf-8
"""CH03 demo - sensor-based alerts of the bang-bang irrigation controller.

Runs the real mycodo.functions.bang_bang.CustomModule from Part2/code (settings
database and daemon replaced by in-memory fakes). A sequence of soil-moisture
readings with sensor drop-outs and a dry spell is fed in; the log listener and
the e-mail listener (DaemonControl.send_email replaced by a printer) report alerts.

Run from the team folder:  python Part2/changes/Change3/demo.py
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


class OneLineFormatter(logging.Formatter):
    """Show the exception message on the same line instead of the full traceback (screenshot-friendly)."""
    def format(self, record):
        text = f"      [log {record.levelname}] {record.getMessage()}"
        if record.exc_info:
            text += f" -> {record.exc_info[0].__name__}: {record.exc_info[1]}"
        return text


_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(OneLineFormatter())
_handler.setLevel(logging.WARNING)
logging.getLogger().addHandler(_handler)

from mycodo.functions import bang_bang  # noqa: E402
from mycodo.utils.sensor_alerts import AlertListener  # noqa: E402


class FakeDaemon:
    """Stands in for DaemonControl: pump state, last command, and e-mail printing."""
    fail_email = False

    def __init__(self):
        self.state, self.command = 'off', None

    def output_state(self, output_id, channel):
        return self.state

    def output_on(self, output_id, output_channel=None):
        self.state, self.command = 'on', 'PUMP ON'

    def output_off(self, output_id, output_channel=None):
        self.state, self.command = 'off', 'PUMP OFF'

    def send_email(self, recipients, message, subject=''):
        if FakeDaemon.fail_email:
            raise OSError("SMTP server unreachable")
        print(f"      [e-mail to {', '.join(recipients)}] {subject}: {message}")


class SmsStub(AlertListener):
    """A custom listener a developer could add (prints instead of sending an SMS)."""
    def on_alert(self, alert):
        print(f"      [custom SMS listener] {alert.kind} value={alert.value}")


def build_controller():
    stored = {"measurement": "soil-sensor,moisture", "measurement_max_age": 360,
              "output": "pump,pump-meas,pump-chan", "direction": "raise", "update_period": 5,
              "setpoint": 50, "hysteresis": 1, "crop_profile": "tomato",
              "alert_critical_moisture": 40, "alert_email": "grower@example.com, agronomist@example.com"}
    row = mock.Mock(unique_id='demo0003-aaaa', log_level_debug=False, custom_options=json.dumps(stored))
    db = mock.MagicMock()
    db.return_value.filter.return_value.all.return_value = []
    db.return_value.filter.return_value.first.return_value = mock.Mock(channel=0)
    with mock.patch.object(bang_bang, 'db_retrieve_table_daemon', return_value=row), \
            mock.patch('mycodo.abstract_base_controller.db_retrieve_table_daemon', db), \
            mock.patch.object(bang_bang, 'DaemonControl', FakeDaemon):
        return bang_bang.CustomModule(row)


def feed(controller, label, result):
    controller.control.command = None
    controller.get_last_measurement = lambda *a, **k: result
    controller.timer_loop = time.time() - 0.001
    print(f"  {label}")
    controller.loop()
    print(f"      => {controller.control.command or '(no command)'}, pump {controller.control.state}")


controller = build_controller()
print("Tomato profile (irrigate below 60 %, stop above 70 %); critical level 40 %;")
print("listeners:", ", ".join(type(l).__name__ for l in controller.alerts.listeners))
print()
for label, result in [
        ("reading 62 %", [time.time(), 62.0]),
        ("sensor drop-out [ts, None]", [time.time(), None]),
        ("sensor drop-out again", [time.time(), None]),
        ("no data at all (None)", None),
        ("reading 58 %", [time.time(), 58.0]),
        ("reading 38 % (critically dry)", [time.time(), 38.0]),
        ("reading 36 % (still dry)", [time.time(), 36.0]),
        ("reading 45 %", [time.time(), 45.0]),
        ("reading 71 %", [time.time(), 71.0])]:
    feed(controller, label, result)

print("\n--- A developer attaches a custom listener; the SMTP server is down (e-mail listener fails)")
controller.alerts.attach(SmsStub())
FakeDaemon.fail_email = True
feed(controller, "reading 30 % (critically dry)", [time.time(), 30.0])
