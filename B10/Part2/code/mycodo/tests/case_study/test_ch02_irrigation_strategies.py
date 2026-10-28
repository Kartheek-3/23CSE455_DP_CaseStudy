# coding=utf-8
"""CH02 - Add different irrigation strategies: one test (or group) per acceptance criterion."""
import datetime
import logging
import time

import pytest

from mycodo.utils.irrigation_strategies import IRRIGATION_STRATEGY_CHOICES
from mycodo.utils.irrigation_strategies import TURN_OFF
from mycodo.utils.irrigation_strategies import TURN_ON
from mycodo.utils.irrigation_strategies import IrrigationContext
from mycodo.utils.irrigation_strategies import LowerHysteresisStrategy
from mycodo.utils.irrigation_strategies import RainSkipStrategy
from mycodo.utils.irrigation_strategies import RaiseHysteresisStrategy
from mycodo.utils.irrigation_strategies import TimeWindowStrategy
from mycodo.utils.irrigation_strategies import UnknownIrrigationStrategyError
from mycodo.utils.irrigation_strategies import build_irrigation_strategy
from mycodo.utils.irrigation_strategies import parse_time_windows

RAIN = dict(rain_measurement='rain-dev,rain-meas', rain_threshold=60, rain_max_age=1800)


def run(module, moisture, state='off', at='12:00', rain=None):
    """One loop() iteration at local time `at` with soil moisture and (optionally) a rain reading."""
    hour, minute = map(int, at.split(':'))
    module._now = lambda: datetime.datetime(2024, 6, 1, hour, minute)
    module.get_last_measurement.side_effect = (
        lambda device, measurement, max_age=None:
        [1700000000.0, rain] if device == 'rain-dev' else [1700000000.0, moisture])
    module.control.reset_mock()
    module.control.output_state.return_value = state
    module.timer_loop = time.time() - 0.001
    module.loop()
    if module.control.output_on.called:
        module.control.output_on.assert_called_once_with('out-dev', output_channel=0)
        return 'on'
    if module.control.output_off.called:
        module.control.output_off.assert_called_once_with('out-dev', output_channel=0)
        return 'off'
    return None


@pytest.mark.parametrize("overrides", [{}, {"irrigation_strategy": "hysteresis"}],
                         ids=["option-absent-in-stored-config", "hysteresis-selected"])
def test_ac1_hysteresis_strategy_is_default_and_unchanged(make_bang_bang, overrides):
    module = make_bang_bang(crop_profile='tomato', **overrides)
    assert isinstance(module.strategy, RaiseHysteresisStrategy)
    assert run(module, 59, 'off') == 'on'
    assert run(module, 71, 'on') == 'off'
    assert run(module, 65, 'on') is None


def test_ac2_time_window_irrigates_only_inside_windows(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato', irrigation_strategy='time_window',
                            irrigation_windows='05:00-09:00,18:00-21:00')
    assert isinstance(module.strategy, TimeWindowStrategy)
    assert run(module, 55, 'off', at='06:30') == 'on'
    assert run(module, 55, 'off', at='12:00') is None
    assert run(module, 55, 'on', at='12:00') == 'off'   # window closed: stop the pump
    assert run(module, 71, 'on', at='20:00') == 'off'   # wet inside a window


def test_ac3_time_window_crossing_midnight_end_exclusive(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato', irrigation_strategy='time_window',
                            irrigation_windows='22:00-02:00')
    assert run(module, 55, 'off', at='23:30') == 'on'
    assert run(module, 55, 'off', at='01:59') == 'on'
    assert run(module, 55, 'off', at='02:00') is None
    assert run(module, 55, 'off', at='22:00') == 'on'   # start inclusive


def test_ac4_skip_if_rain_uses_rain_indicator_and_threshold(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato', irrigation_strategy='skip_if_rain', **RAIN)
    assert isinstance(module.strategy, RainSkipStrategy)
    assert run(module, 55, 'off', rain=80) is None
    module.get_last_measurement.assert_any_call('rain-dev', 'rain-meas', max_age=1800)
    module.get_last_measurement.assert_any_call('meas-dev', 'meas-id', max_age=360)
    assert run(module, 55, 'on', rain=80) == 'off'
    assert run(module, 55, 'off', rain=60) is None      # at the threshold: skip
    assert run(module, 55, 'off', rain=20) == 'on'


def test_ac5_missing_rain_reading_falls_back_to_band(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato', irrigation_strategy='skip_if_rain', **RAIN)
    assert run(module, 55, 'off', rain=None) == 'on'
    module.logger.warning.assert_called_once_with(
        "No rain indicator measurement available. Irrigating by the soil moisture band only.")


@pytest.mark.parametrize("text", ['25:00-26:00', 'abc', '', '06:00-06:00', '06:00-07:00,'])
def test_ac6_invalid_time_windows_rejected(text):
    with pytest.raises(ValueError):
        parse_time_windows(text)


def test_ac6_invalid_windows_in_config_fall_back_to_hysteresis(make_bang_bang, caplog):
    with caplog.at_level(logging.ERROR):
        module = make_bang_bang(crop_profile='tomato', irrigation_strategy='time_window',
                                irrigation_windows='abc')
    assert "Irrigation strategy 'time_window' cannot be used" in caplog.text
    assert isinstance(module.strategy, RaiseHysteresisStrategy)
    assert run(module, 55, 'off', at='12:00') == 'on'


def test_ac7_unknown_strategy_falls_back_to_hysteresis(make_bang_bang, caplog):
    with caplog.at_level(logging.ERROR):
        module = make_bang_bang(irrigation_strategy='flood')
    assert "Unknown irrigation strategy 'flood'" in caplog.text
    assert isinstance(module.strategy, RaiseHysteresisStrategy)
    assert run(module, 48.9) == 'on'


def test_ac7_skip_if_rain_without_rain_measurement_falls_back(make_bang_bang, caplog):
    with caplog.at_level(logging.ERROR):
        module = make_bang_bang(irrigation_strategy='skip_if_rain')
    assert "No rain indicator measurement selected" in caplog.text
    assert isinstance(module.strategy, RaiseHysteresisStrategy)
    assert run(module, 48.9) == 'on'
    module.get_last_measurement.assert_called_once_with('meas-dev', 'meas-id', max_age=360)


def _context(measurement, state='off', at=(12, 0), rain=None):
    return IrrigationContext(measurement=measurement, output_state=state,
                             lower_threshold=60, upper_threshold=70,
                             now=datetime.datetime(2024, 6, 1, *at), rain_indicator=rain)


def test_ac8_strategies_compose_and_work_with_either_direction():
    composed = RainSkipStrategy(
        TimeWindowStrategy(LowerHysteresisStrategy(), parse_time_windows('06:00-18:00')), 60)
    assert composed.needs_rain_indicator()
    assert composed.decide(_context(71)) == TURN_ON                    # lower: above band -> on
    assert composed.decide(_context(59, 'on')) == TURN_OFF             # lower: below band -> off
    assert composed.decide(_context(71, 'on', at=(19, 0))) == TURN_OFF  # outside window
    assert composed.decide(_context(71, rain=75)) is None               # rain expected

    built = build_irrigation_strategy('time_window', 'lower', time_windows='06:00-18:00')
    assert isinstance(built, TimeWindowStrategy)
    assert isinstance(built.inner, LowerHysteresisStrategy)
    assert not built.needs_rain_indicator()
    with pytest.raises(UnknownIrrigationStrategyError):
        build_irrigation_strategy('flood', 'raise')


def test_ac9_function_information_offers_strategy_options():
    from mycodo.functions.bang_bang import FUNCTION_INFORMATION
    options = {o['id']: o for o in FUNCTION_INFORMATION['custom_options']}
    strategy = options['irrigation_strategy']
    assert strategy['type'] == 'select'
    assert strategy['default_value'] == 'hysteresis'
    assert strategy['options_select'] == IRRIGATION_STRATEGY_CHOICES
    assert [v for v, _label in IRRIGATION_STRATEGY_CHOICES] == ['hysteresis', 'time_window', 'skip_if_rain']
    assert options['irrigation_windows']['type'] == 'text'
    assert options['rain_measurement']['type'] == 'select_measurement'
    assert options['rain_threshold']['type'] == 'float'
    assert options['rain_max_age']['type'] == 'integer'
    for option_id in ('irrigation_strategy', 'irrigation_windows', 'rain_measurement',
                      'rain_threshold', 'rain_max_age'):
        assert not options[option_id]['required']
