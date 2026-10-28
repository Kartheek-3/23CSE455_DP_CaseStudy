# coding=utf-8
#
#  bang_bang.py - A hysteretic control for On/Off Outputs
#
#  Copyright (C) 2015-2020 Rob Bultman <rob@firstbuild.com>
#
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
        self.output_channel = None
        self.update_period = None

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

        self.logger.info(
            "Bang-Bang controller started with options: "
            "Measurement Device: {}, Measurement: {}, Output: {}, "
            "Output_Channel: {}, Crop Profile: {}, Setpoint: {}, Hysteresis: {}, "
            "Direction: {}, Period: {}".format(
                self.measurement_device_id,
                self.measurement_measurement_id,
                self.output_device_id,
                self.output_channel,
                self.crop_profile,
                self.setpoint,
                self.hysteresis,
                self.direction,
                self.update_period))

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

        if self.direction == 'raise':
            if last_measurement[1] > self._upper_threshold():
                if output_state == 'on':
                    self.control.output_off(
                        self.output_device_id,
                        output_channel=self.output_channel)
            else:
                if last_measurement[1] < self._lower_threshold():
                    self.control.output_on(
                        self.output_device_id,
                        output_channel=self.output_channel)
        elif self.direction == 'lower':
            if last_measurement[1] < self._lower_threshold():
                if output_state == 'on':
                    self.control.output_off(
                        self.output_device_id,
                        output_channel=self.output_channel)
            else:
                if last_measurement[1] > self._upper_threshold():
                    self.control.output_on(
                        self.output_device_id,
                        output_channel=self.output_channel)
        else:
            self.logger.error("Unknown controller direction: '{}'".format(self.direction))

    def _lower_threshold(self):
        """Lower edge of the control band (setpoint - hysteresis)."""
        return self.setpoint - self.hysteresis

    def _upper_threshold(self):
        """Upper edge of the control band (setpoint + hysteresis)."""
        return self.setpoint + self.hysteresis

    def stop_function(self):
        self.control.output_off(self.output_device_id, self.output_channel)
