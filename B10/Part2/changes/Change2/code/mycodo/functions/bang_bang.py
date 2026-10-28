# coding=utf-8
#
#  bang_bang.py - A hysteretic control for On/Off Outputs
#
#  Copyright (C) 2015-2020 Rob Bultman <rob@firstbuild.com>
#
import datetime
import time

from flask_babel import lazy_gettext

from mycodo.databases.models import CustomController
from mycodo.functions.base_function import AbstractFunction
from mycodo.mycodo_client import DaemonControl
from mycodo.utils.constraints_pass import constraints_pass_positive_value
from mycodo.utils.crop_profiles import CUSTOM_CROP_PROFILE
from mycodo.utils.crop_profiles import UnknownCropProfileError
from mycodo.utils.crop_profiles import crop_profile_choices
from mycodo.utils.crop_profiles import get_crop_profile
from mycodo.utils.database import db_retrieve_table_daemon
from mycodo.utils.irrigation_strategies import DEFAULT_IRRIGATION_STRATEGY
from mycodo.utils.irrigation_strategies import DIRECTION_STRATEGIES
from mycodo.utils.irrigation_strategies import IRRIGATION_STRATEGY_CHOICES
from mycodo.utils.irrigation_strategies import TURN_OFF
from mycodo.utils.irrigation_strategies import TURN_ON
from mycodo.utils.irrigation_strategies import IrrigationContext
from mycodo.utils.irrigation_strategies import UnknownIrrigationStrategyError
from mycodo.utils.irrigation_strategies import build_irrigation_strategy

# TODO: Remove this at next major version (obsolete because a On/Off Raise/Lower/Both Bang-Bang exists
FUNCTION_INFORMATION = {
    'function_name_unique': 'bang_bang',
    'function_name': 'Bang-Bang Hysteretic (On/Off) (Raise/Lower)',
    'function_name_short': 'Bang-Bang (On/Off, Raise/Lower)',

    'message': 'A simple bang-bang control for controlling one output from one input.'
        ' Select an input, an output, enter a setpoint and a hysteresis, and select a direction.'
        ' The output will turn on when the input is below (lower = setpoint - hysteresis) and turn off when'
        ' the input is above (higher = setpoint + hysteresis). This is the behavior when Raise is selected, such'
        ' as when heating. Lower direction has the opposite behavior - it will try to'
        ' turn the output on in order to drive the input lower.',

    'options_disabled': [
        'measurements_select',
        'measurements_configure'
    ],

    'custom_options': [
        {
            'id': 'measurement',
            'type': 'select_measurement',
            'default_value': '',
            'required': True,
            'options_select': [
                'Input',
                'Function'
            ],
            'name': lazy_gettext('Measurement'),
            'phrase': lazy_gettext('Select a measurement the selected output will affect')
        },
        {
            'id': 'measurement_max_age',
            'type': 'integer',
            'default_value': 360,
            'required': True,
            'name': "{}: {} ({})".format(lazy_gettext("Measurement"), lazy_gettext("Max Age"),
                                           lazy_gettext("Seconds")),
            'phrase': lazy_gettext('The maximum age of the measurement to use')
        },
        {
            'id': 'output',
            'type': 'select_measurement_channel',
            'default_value': '',
            'required': True,
            'options_select': [
                'Output_Channels_Measurements',
            ],
            'name': lazy_gettext('Output'),
            'phrase': lazy_gettext('Select an output to control that will affect the measurement')
        },
        {
            'id': 'crop_profile',
            'type': 'select',
            'default_value': CUSTOM_CROP_PROFILE,
            'required': False,
            'options_select': [
                (CUSTOM_CROP_PROFILE, 'Custom (use Setpoint and Hysteresis)')
            ] + crop_profile_choices(),
            'name': 'Crop Profile',
            'phrase': 'Select a crop to use its target soil moisture (%) as the setpoint and its tolerance '
                      'as the hysteresis, or Custom to use the Setpoint and Hysteresis options'
        },
        {
            'id': 'setpoint',
            'type': 'float',
            'default_value': 50,
            'required': True,
            'name': lazy_gettext('Setpoint'),
            'phrase': lazy_gettext('The desired setpoint')
        },
        {
            'id': 'hysteresis',
            'type': 'float',
            'default_value': 1,
            'required': True,
            'constraints_pass': constraints_pass_positive_value,
            'name': lazy_gettext('Hysteresis'),
            'phrase': lazy_gettext('The amount above and below the setpoint that defines the control band')
        },
        {
            'id': 'direction',
            'type': 'select',
            'default_value': 'raise',
            'required': True,
            'options_select': [
                ('raise', 'Raise'),
                ('lower', 'Lower')
            ],
            'name': lazy_gettext('Direction'),
            'phrase': 'Raise means the measurement will increase when the control is on (heating). Lower means the measurement will decrease when the output is on (cooling)'
        },
        {
            'id': 'irrigation_strategy',
            'type': 'select',
            'default_value': DEFAULT_IRRIGATION_STRATEGY,
            'required': False,
            'options_select': IRRIGATION_STRATEGY_CHOICES,
            'name': 'Irrigation Strategy',
            'phrase': 'Hysteresis band only, band only inside the time windows, or band unless rain is expected'
        },
        {
            'id': 'irrigation_windows',
            'type': 'text',
            'default_value': '05:00-09:00,18:00-21:00',
            'required': False,
            'name': 'Irrigation Time Windows',
            'phrase': 'For the Time windows strategy: allowed periods HH:MM-HH:MM, separated by commas '
                      '(a window may cross midnight, e.g. 22:00-02:00)'
        },
        {
            'id': 'rain_measurement',
            'type': 'select_measurement',
            'default_value': '',
            'required': False,
            'options_select': [
                'Input',
                'Function'
            ],
            'name': 'Rain Indicator Measurement',
            'phrase': 'For the Skip when rain strategy: a measurement that indicates expected rain '
                      '(e.g. precipitation probability, %)'
        },
        {
            'id': 'rain_threshold',
            'type': 'float',
            'default_value': 60.0,
            'required': False,
            'name': 'Rain Indicator Threshold',
            'phrase': 'For the Skip when rain strategy: skip irrigation while the rain indicator is at or above this value'
        },
        {
            'id': 'rain_max_age',
            'type': 'integer',
            'default_value': 3600,
            'required': False,
            'constraints_pass': constraints_pass_positive_value,
            'name': 'Rain Indicator Max Age (Seconds)',
            'phrase': 'The maximum age of the rain indicator measurement to use'
        },
        {
            'id': 'update_period',
            'type': 'float',
            'default_value': 5,
            'required': True,
            'constraints_pass': constraints_pass_positive_value,
            'name': "{} ({})".format(lazy_gettext('Period'), lazy_gettext('Seconds')),
            'phrase': lazy_gettext('The duration between measurements or actions')
        }
    ]
}


class CustomModule(AbstractFunction):
    """
    Class to operate the bang-bang controller
    """
    def __init__(self, function, testing=False):
        super().__init__(function, testing=testing, name=__name__)

        self.control_variable = None
        self.control = DaemonControl()
        self.outputIsOn = False
        self.timer_loop = time.time()

        # Initialize custom options
        self.measurement_device_id = None
        self.measurement_measurement_id = None
        self.measurement_max_age = None
        self.output_device_id = None
        self.output_measurement_id = None
        self.output_channel_id = None
        self.crop_profile = None
        self.setpoint = None
        self.hysteresis = None
        self.direction = None
        self.irrigation_strategy = None
        self.irrigation_windows = None
        self.rain_measurement_device_id = None
        self.rain_measurement_measurement_id = None
        self.rain_threshold = None
        self.rain_max_age = None
        self.output_channel = None
        self.update_period = None
        self.strategy = None

        # Set custom options
        custom_function = db_retrieve_table_daemon(
            CustomController, unique_id=self.unique_id)
        self.setup_custom_options(
            FUNCTION_INFORMATION['custom_options'], custom_function)

        if not testing:
            self.try_initialize()

    def initialize(self):
        self.output_channel = self.get_output_channel_from_channel_id(self.output_channel_id)
        self._apply_crop_profile()
        self.strategy = self._build_irrigation_strategy()

        self.logger.info(
            "Bang-Bang controller started with options: "
            "Measurement Device: {}, Measurement: {}, Output: {}, "
            "Output_Channel: {}, Crop Profile: {}, Setpoint: {}, Hysteresis: {}, "
            "Direction: {}, Irrigation Strategy: {}, Period: {}".format(
                self.measurement_device_id,
                self.measurement_measurement_id,
                self.output_device_id,
                self.output_channel,
                self.crop_profile,
                self.setpoint,
                self.hysteresis,
                self.direction,
                type(self.strategy).__name__,
                self.update_period))

    def _build_irrigation_strategy(self):
        """Create the configured irrigation strategy (None if the direction is unknown).

        An invalid strategy configuration is logged and replaced by the plain
        hysteresis band of the configured direction.
        """
        if self.direction not in DIRECTION_STRATEGIES:
            return None  # reported by loop()
        name = self.irrigation_strategy or DEFAULT_IRRIGATION_STRATEGY
        try:
            if name == 'skip_if_rain' and not (
                    self.rain_measurement_device_id and self.rain_measurement_measurement_id):
                raise ValueError("No rain indicator measurement selected")
            return build_irrigation_strategy(
                name,
                self.direction,
                time_windows=self.irrigation_windows,
                rain_threshold=self.rain_threshold)
        except (UnknownIrrigationStrategyError, ValueError) as err:
            self.logger.error(
                f"Irrigation strategy '{name}' cannot be used: {err}. "
                f"Using the '{DEFAULT_IRRIGATION_STRATEGY}' strategy.")
            return build_irrigation_strategy(DEFAULT_IRRIGATION_STRATEGY, self.direction)

    def _apply_crop_profile(self):
        """Use the selected crop's target moisture and tolerance as setpoint and hysteresis."""
        if not self.crop_profile or self.crop_profile == CUSTOM_CROP_PROFILE:
            return
        try:
            profile = get_crop_profile(self.crop_profile)
        except UnknownCropProfileError:
            self.logger.error(
                f"Unknown crop profile '{self.crop_profile}'. "
                f"Using the configured Setpoint ({self.setpoint}) and Hysteresis ({self.hysteresis}).")
            return
        self.setpoint = profile.target_moisture
        self.hysteresis = profile.tolerance

    def loop(self):
        if self.timer_loop > time.time():
            return

        while self.timer_loop < time.time():
            self.timer_loop += self.update_period

        if self.output_channel is None:
            self.logger.error("Cannot run bang-bang controller: Check output channel.")
            return

        last_measurement = self.get_last_measurement(
            self.measurement_device_id,
            self.measurement_measurement_id,
            max_age=self.measurement_max_age)

        output_state = self.control.output_state(self.output_device_id, self.output_channel)

        self.logger.debug(f"measurement: {last_measurement[1]}, output state: {output_state}, "
                          f"setpoint: {self.setpoint}, hysteresis: {self.hysteresis}")

        if not last_measurement or last_measurement[1] is None:
            self.logger.error("No measurement available. Cannot operate without measurement. Turning output Off.")
            self.control.output_off(self.output_device_id, output_channel=self.output_channel)
            return

        if self.strategy is None:
            self.logger.error("Unknown controller direction: '{}'".format(self.direction))
            return

        self._apply_decision(self.strategy.decide(IrrigationContext(
            measurement=last_measurement[1],
            output_state=output_state,
            lower_threshold=self._lower_threshold(),
            upper_threshold=self._upper_threshold(),
            now=self._now(),
            rain_indicator=self._read_rain_indicator())))

    @staticmethod
    def _now():
        """Local time used by time-based irrigation strategies."""
        return datetime.datetime.now()

    def _read_rain_indicator(self):
        """Latest rain indicator value if the strategy needs it, else None."""
        if not self.strategy.needs_rain_indicator():
            return None
        rain = self.get_last_measurement(
            self.rain_measurement_device_id,
            self.rain_measurement_measurement_id,
            max_age=self.rain_max_age)
        if not rain or rain[1] is None:
            self.logger.warning(
                "No rain indicator measurement available. Irrigating by the soil moisture band only.")
            return None
        return rain[1]

    def _apply_decision(self, decision):
        """Send the strategy's decision to the output."""
        if decision == TURN_ON:
            self.control.output_on(
                self.output_device_id,
                output_channel=self.output_channel)
        elif decision == TURN_OFF:
            self.control.output_off(
                self.output_device_id,
                output_channel=self.output_channel)

    def _lower_threshold(self):
        """Lower edge of the control band (setpoint - hysteresis)."""
        return self.setpoint - self.hysteresis

    def _upper_threshold(self):
        """Upper edge of the control band (setpoint + hysteresis)."""
        return self.setpoint + self.hysteresis

    def stop_function(self):
        self.control.output_off(self.output_device_id, self.output_channel)
