# coding=utf-8
"""Characterization tests for mycodo/functions/bang_bang.py (CustomModule).

They lock in the behaviour of the baseline code (commit ee70a111) before the
case-study changes: option parsing in __init__/initialize(), the decisions of
loop() for both directions, its guard clauses and timer, and stop_function().
"""
import time

import pytest

from mycodo.tests.case_study.helpers import run_loop


def test_char_init_parses_stored_custom_options(make_bang_bang):
    module = make_bang_bang()
    assert module.measurement_device_id == 'meas-dev'
    assert module.measurement_measurement_id == 'meas-id'
    assert module.measurement_max_age == 360
    assert module.output_device_id == 'out-dev'
    assert module.output_measurement_id == 'out-meas'
    assert module.output_channel_id == 'out-chan'
    assert module.setpoint == 50
    assert module.hysteresis == 1
    assert module.direction == 'raise'
    assert module.update_period == 5


def test_char_initialize_resolves_output_channel_number(make_bang_bang):
    assert make_bang_bang(output_channel=3).output_channel == 3


def test_char_loop_queries_measurement_and_output_state(make_bang_bang):
    module = make_bang_bang()
    control = run_loop(module, 50.0)
    module.get_last_measurement.assert_called_once_with('meas-dev', 'meas-id', max_age=360)
    control.output_state.assert_called_once_with('out-dev', 0)


# (direction, measurement, output state, expected command or None)
DECISIONS = [
    # raise (e.g. irrigate when soil moisture is low): band is 49..51
    ('raise', 48.9, 'off', 'on'),
    ('raise', 48.9, 'on', 'on'),     # on is re-sent even when already on
    ('raise', 49.0, 'off', None),    # lower edge is not inclusive
    ('raise', 50.0, 'off', None),
    ('raise', 50.0, 'on', None),
    ('raise', 51.0, 'on', None),     # upper edge is not inclusive
    ('raise', 51.1, 'on', 'off'),
    ('raise', 51.1, 'off', None),    # off only sent when currently on
    # lower (e.g. drive a value down): mirrored
    ('lower', 51.1, 'off', 'on'),
    ('lower', 51.1, 'on', 'on'),
    ('lower', 51.0, 'off', None),
    ('lower', 50.0, 'on', None),
    ('lower', 49.0, 'on', None),
    ('lower', 48.9, 'on', 'off'),
    ('lower', 48.9, 'off', None),
]


@pytest.mark.parametrize("direction,value,state,expected", DECISIONS)
def test_char_loop_hysteresis_decisions(make_bang_bang, direction, value, state, expected):
    control = run_loop(make_bang_bang(direction=direction), value, output_state=state)
    if expected == 'on':
        control.output_on.assert_called_once_with('out-dev', output_channel=0)
        control.output_off.assert_not_called()
    elif expected == 'off':
        control.output_off.assert_called_once_with('out-dev', output_channel=0)
        control.output_on.assert_not_called()
    else:
        control.output_on.assert_not_called()
        control.output_off.assert_not_called()


def test_char_loop_uses_configured_setpoint_and_hysteresis(make_bang_bang):
    module = make_bang_bang(setpoint=30, hysteresis=2.5)
    run_loop(module, 27.4)  # below 30 - 2.5
    module.control.output_on.assert_called_once_with('out-dev', output_channel=0)


def test_char_missing_measurement_value_turns_output_off(make_bang_bang):
    module = make_bang_bang()
    control = run_loop(module, None, output_state='on')
    control.output_off.assert_called_once_with('out-dev', output_channel=0)
    control.output_on.assert_not_called()
    module.logger.error.assert_called_once_with(
        "No measurement available. Cannot operate without measurement. Turning output Off.")


def test_char_unknown_direction_logs_error_and_does_nothing(make_bang_bang):
    module = make_bang_bang(direction='sideways')
    control = run_loop(module, 10.0, output_state='on')
    control.output_on.assert_not_called()
    control.output_off.assert_not_called()
    module.logger.error.assert_called_once_with("Unknown controller direction: 'sideways'")


def test_char_missing_output_channel_stops_before_reading(make_bang_bang):
    module = make_bang_bang(output_channel=None)
    control = run_loop(module, 10.0)
    module.get_last_measurement.assert_not_called()
    control.output_state.assert_not_called()
    module.logger.error.assert_called_once_with("Cannot run bang-bang controller: Check output channel.")


def test_char_loop_returns_early_when_period_not_elapsed(make_bang_bang):
    module = make_bang_bang()
    module.timer_loop = time.time() + 100
    module.loop()
    module.get_last_measurement.assert_not_called()
    module.control.output_state.assert_not_called()


def test_char_loop_advances_timer_by_whole_periods(make_bang_bang):
    module = make_bang_bang()
    module.get_last_measurement.return_value = [1700000000.0, 50.0]
    start = time.time() - 12
    module.timer_loop = start
    module.loop()
    assert module.timer_loop - start == 15  # 3 periods of 5 s


def test_char_stop_function_turns_output_off(make_bang_bang):
    module = make_bang_bang()
    module.stop_function()
    module.control.output_off.assert_called_once_with('out-dev', 0)
