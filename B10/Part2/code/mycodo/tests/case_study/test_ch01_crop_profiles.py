# coding=utf-8
"""CH01 - Add new crop types: one test (or group) per acceptance criterion."""
import logging

import pytest

from mycodo.tests.case_study.helpers import run_loop
from mycodo.utils.crop_profiles import CUSTOM_CROP_PROFILE
from mycodo.utils.crop_profiles import CropProfile
from mycodo.utils.crop_profiles import UnknownCropProfileError
from mycodo.utils.crop_profiles import crop_profile_choices
from mycodo.utils.crop_profiles import get_crop_profile
from mycodo.utils.crop_profiles import register_crop_profile
from mycodo.utils.crop_profiles import unregister_crop_profile


def test_ac1_tomato_profile_supplies_setpoint_and_tolerance(make_bang_bang):
    module = make_bang_bang(crop_profile='tomato')
    assert (module.setpoint, module.hysteresis) == (65.0, 5.0)

    run_loop(module, 59.0, output_state='off')  # below 65 - 5: irrigate
    module.control.output_on.assert_called_once_with('out-dev', output_channel=0)

    module.control.reset_mock()
    run_loop(module, 71.0, output_state='on')  # above 65 + 5: stop irrigating
    module.control.output_off.assert_called_once_with('out-dev', output_channel=0)
    module.control.output_on.assert_not_called()

    module.control.reset_mock()
    run_loop(module, 65.0, output_state='on')  # inside the band: no command
    module.control.output_on.assert_not_called()
    module.control.output_off.assert_not_called()


def test_ac2_each_crop_uses_its_own_values(make_bang_bang):
    rice = make_bang_bang(crop_profile='rice')
    wheat = make_bang_bang(crop_profile='wheat')
    assert (rice.setpoint, rice.hysteresis) == (85.0, 5.0)
    assert (wheat.setpoint, wheat.hysteresis) == (50.0, 5.0)

    run_loop(rice, 70.0, output_state='on')
    run_loop(wheat, 70.0, output_state='on')
    rice.control.output_on.assert_called_once_with('out-dev', output_channel=0)
    rice.control.output_off.assert_not_called()
    wheat.control.output_off.assert_called_once_with('out-dev', output_channel=0)
    wheat.control.output_on.assert_not_called()


@pytest.mark.parametrize("overrides", [{}, {"crop_profile": CUSTOM_CROP_PROFILE}],
                         ids=["option-absent-in-stored-config", "custom-selected"])
def test_ac3_custom_or_missing_crop_keeps_configured_values(make_bang_bang, overrides):
    module = make_bang_bang(**overrides)
    assert module.crop_profile == CUSTOM_CROP_PROFILE
    assert (module.setpoint, module.hysteresis) == (50, 1)
    run_loop(module, 48.9)
    module.control.output_on.assert_called_once_with('out-dev', output_channel=0)


@pytest.fixture
def lettuce():
    profile = register_crop_profile(CropProfile('lettuce', 'Lettuce', target_moisture=70.0, tolerance=4.0))
    yield profile
    unregister_crop_profile('lettuce')


def test_ac4_new_crop_type_registered_in_one_place(make_bang_bang, lettuce):
    assert get_crop_profile('lettuce') is lettuce
    assert ('lettuce', 'Lettuce') in crop_profile_choices()

    module = make_bang_bang(crop_profile='lettuce')
    assert (module.setpoint, module.hysteresis) == (70.0, 4.0)
    run_loop(module, 65.9)  # below 70 - 4
    module.control.output_on.assert_called_once_with('out-dev', output_channel=0)


def test_ac5_unknown_crop_logs_error_and_keeps_configured_values(make_bang_bang, caplog):
    with caplog.at_level(logging.ERROR):
        module = make_bang_bang(crop_profile='banana', setpoint=40, hysteresis=2)
    assert (module.setpoint, module.hysteresis) == (40, 2)
    assert "Unknown crop profile 'banana'" in caplog.text
    run_loop(module, 37.9)
    module.control.output_on.assert_called_once_with('out-dev', output_channel=0)


def test_ac5_lookup_of_unknown_crop_raises_lookup_error():
    with pytest.raises(UnknownCropProfileError):
        get_crop_profile('banana')


@pytest.mark.parametrize("kwargs", [
    dict(name_unique='a', name='A', target_moisture=50, tolerance=0),
    dict(name_unique='a', name='A', target_moisture=50, tolerance=-1),
    dict(name_unique='a', name='A', target_moisture=101, tolerance=1),
    dict(name_unique='a', name='A', target_moisture=-1, tolerance=1),
    dict(name_unique='a', name='A', target_moisture=98, tolerance=5),
    dict(name_unique='a', name='A', target_moisture=2, tolerance=5),
    dict(name_unique='', name='A', target_moisture=50, tolerance=5),
    dict(name_unique=CUSTOM_CROP_PROFILE, name='Custom', target_moisture=50, tolerance=5),
], ids=["zero-tolerance", "negative-tolerance", "target-over-100", "target-below-0",
        "band-over-100", "band-below-0", "empty-id", "reserved-id"])
def test_ac6_invalid_crop_definition_rejected(kwargs):
    before = crop_profile_choices()
    with pytest.raises(ValueError):
        register_crop_profile(CropProfile(**kwargs))
    assert crop_profile_choices() == before


def test_ac6_duplicate_crop_id_rejected():
    before = crop_profile_choices()
    with pytest.raises(ValueError):
        register_crop_profile(CropProfile('tomato', 'Tomato again', target_moisture=60, tolerance=5))
    assert crop_profile_choices() == before
    assert get_crop_profile('tomato').target_moisture == 65.0


def test_ac7_function_information_offers_crop_selection():
    from mycodo.functions.bang_bang import FUNCTION_INFORMATION
    option = next(o for o in FUNCTION_INFORMATION['custom_options'] if o['id'] == 'crop_profile')
    assert option['type'] == 'select'
    assert option['default_value'] == CUSTOM_CROP_PROFILE
    assert not option['required']
    ids = [value for value, _label in option['options_select']]
    assert ids == [CUSTOM_CROP_PROFILE] + [crop_id for crop_id, _name in crop_profile_choices()]
    assert ids == ['custom', 'rice', 'tomato', 'wheat']
