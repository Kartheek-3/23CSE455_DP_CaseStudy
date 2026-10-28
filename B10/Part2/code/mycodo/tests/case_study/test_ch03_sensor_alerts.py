# coding=utf-8
"""CH03 - Add sensor-based alerts: one test (or group) per acceptance criterion."""
import logging
import time
from unittest import mock

import pytest

from mycodo.tests.case_study.helpers import run_loop
from mycodo.utils.sensor_alerts import CRITICALLY_DRY
from mycodo.utils.sensor_alerts import MISSING_MEASUREMENT
from mycodo.utils.sensor_alerts import AlertListener
from mycodo.utils.sensor_alerts import EmailAlertListener
from mycodo.utils.sensor_alerts import LogAlertListener
from mycodo.utils.sensor_alerts import SensorAlert
from mycodo.utils.sensor_alerts import SensorAlertNotifier


class RecordingListener(AlertListener):
    """A custom listener as a developer would add one."""
    def __init__(self):
        self.alerts = []

    def on_alert(self, alert):
        self.alerts.append(alert)


def attach_recorder(module):
    recorder = RecordingListener()
    module.alerts.attach(recorder)
    return recorder


def test_ac1_missing_measurement_alerts_log_and_email(make_bang_bang, caplog):
    module = make_bang_bang(alert_email='grower@example.com')
    with caplog.at_level(logging.WARNING):
        control = run_loop(module, None, output_state='on')
    control.output_off.assert_called_once_with('out-dev', output_channel=0)
    assert "ALERT [missing_measurement]" in caplog.text
    control.send_email.assert_called_once()
    args, kwargs = control.send_email.call_args
    assert args[0] == ['grower@example.com']
    assert 'no measurement available' in args[1]
    assert kwargs == {'subject': 'Mycodo alert: missing_measurement'}


@pytest.mark.parametrize("result", [None, []], ids=["none", "empty-list"])
def test_ac2_none_or_empty_result_no_longer_crashes(make_bang_bang, result):
    module = make_bang_bang()
    recorder = attach_recorder(module)
    module.get_last_measurement.return_value = result
    module.control.output_state.return_value = 'on'
    module.timer_loop = time.time() - 0.001
    module.loop()  # baseline raised TypeError / IndexError here
    module.control.output_off.assert_called_once_with('out-dev', output_channel=0)
    assert [a.kind for a in recorder.alerts] == [MISSING_MEASUREMENT]


def test_ac3_critically_dry_alert_does_not_change_irrigation(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato', alert_critical_moisture=40)
    recorder = attach_recorder(module)
    control = run_loop(module, 35.0, output_state='off')
    control.output_on.assert_called_once_with('out-dev', output_channel=0)
    assert len(recorder.alerts) == 1
    alert = recorder.alerts[0]
    assert (alert.kind, alert.value, alert.source) == (CRITICALLY_DRY, 35.0, 'func-0001')
    assert 'below the critical level 40' in alert.message


def test_ac4_alerts_once_per_episode(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato', alert_critical_moisture=40)
    recorder = attach_recorder(module)
    for reading in (35.0, 34.0, 50.0, 33.0):
        run_loop(module, reading)
    assert [a.value for a in recorder.alerts] == [35.0, 33.0]

    recorder.alerts.clear()
    for reading in (None, None, 50.0, None):
        run_loop(module, reading)
    assert [a.kind for a in recorder.alerts] == [MISSING_MEASUREMENT, MISSING_MEASUREMENT]


def test_ac5_email_listener_only_with_recipients(make_bang_bang):
    plain = make_bang_bang()
    assert [type(l) for l in plain.alerts.listeners] == [LogAlertListener]
    run_loop(plain, None)
    plain.control.send_email.assert_not_called()

    with_email = make_bang_bang(alert_email=' a@x.com, b@y.com ')
    assert [type(l) for l in with_email.alerts.listeners] == [LogAlertListener, EmailAlertListener]
    assert with_email.alerts.listeners[1].recipients == ['a@x.com', 'b@y.com']


def test_ac6_failing_listener_does_not_stop_others_or_control(make_bang_bang, caplog):
    module = make_bang_bang(crop_profile='tomato', alert_critical_moisture=40, alert_email='a@x.com')
    module.control.send_email.side_effect = OSError("SMTP server unreachable")
    recorder = attach_recorder(module)
    with caplog.at_level(logging.WARNING):
        control = run_loop(module, 35.0, output_state='off')  # must not raise
    control.output_on.assert_called_once_with('out-dev', output_channel=0)
    assert "Alert listener EmailAlertListener failed to handle 'critically_dry' alert" in caplog.text
    assert "ALERT [critically_dry]" in caplog.text
    assert [a.kind for a in recorder.alerts] == [CRITICALLY_DRY]


@pytest.mark.parametrize("overrides", [{}, {"alert_critical_moisture": 0}], ids=["absent", "zero"])
def test_ac7_no_dry_alert_when_disabled(make_bang_bang, overrides):
    module = make_bang_bang(**overrides)
    recorder = attach_recorder(module)
    control = run_loop(module, 1.0, output_state='off')
    assert recorder.alerts == []
    assert control.method_calls == [
        mock.call.output_state('out-dev', 0),
        mock.call.output_on('out-dev', output_channel=0),
    ]


def test_ac8_custom_listener_attach_and_detach():
    notifier = SensorAlertNotifier()
    recorder = RecordingListener()
    notifier.attach(recorder)
    notifier.attach(recorder)  # attaching twice has no effect
    alert = SensorAlert(kind=CRITICALLY_DRY, source='f1', message='dry', value=10)
    assert notifier.raise_alert(alert) is True
    assert notifier.raise_alert(alert) is False  # still active: not repeated
    notifier.clear(CRITICALLY_DRY)
    notifier.detach(recorder)
    assert notifier.raise_alert(alert) is True
    assert recorder.alerts == [alert]
    with pytest.raises(ValueError):
        EmailAlertListener([], send=lambda *a, **k: None)


def test_ac9_function_information_offers_alert_options():
    from mycodo.functions.bang_bang import FUNCTION_INFORMATION
    options = {o['id']: o for o in FUNCTION_INFORMATION['custom_options']}
    assert (options['alert_critical_moisture']['type'], options['alert_critical_moisture']['default_value']) == ('float', 0.0)
    assert (options['alert_email']['type'], options['alert_email']['default_value']) == ('text', '')
    assert not options['alert_critical_moisture']['required']
    assert not options['alert_email']['required']
