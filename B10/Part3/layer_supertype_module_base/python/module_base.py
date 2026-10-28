"""Layer Supertype: daemon module base.

Derived from mycodo/abstract_base_controller.py (AbstractBaseController.setup_custom_options_json,
_set_custom_option, _get_custom_option) and its layer members mycodo/inputs/base_input.py (AbstractInput)
and mycodo/functions/base_function.py (AbstractFunction). The DB-backed custom options become an
in-memory OptionStore; parsed options go into self.options instead of setattr; stored values are text
instead of JSON; logger.error calls are collected in self.errors; the configuration errors after which
the source logs and returns now raise ConfigurationError.
"""


class ConfigurationError(Exception):
    pass


class OptionStore:
    """Stand-in for the custom_options column of each (table, unique_id) row."""

    def __init__(self):
        self.rows = {}

    def row(self, table, unique_id):
        return self.rows.setdefault((table, unique_id), {})


class AbstractBaseController:
    """Layer supertype: behaviour shared by every daemon-side module type."""

    def __init__(self, unique_id, store):
        self.unique_id, self.store, self.options, self.errors = unique_id, store, {}, []

    def setup_custom_options(self, custom_options, stored):
        for each_option_default in custom_options:
            option_type, option_id = each_option_default.get('type'), each_option_default.get('id')
            if option_type is None:
                raise ConfigurationError(f"'type' not found in custom_options: {each_option_default}")
            if option_id is None and option_type not in ('new_line', 'message'):
                raise ConfigurationError(f"'id' not found in custom_options: {each_option_default}")
            if 'default_value' not in each_option_default and option_type != 'new_line':
                raise ConfigurationError(f"'default_value' not found in custom_options: {each_option_default}")
            if option_type in ('new_line', 'message'):
                continue
            option_value = stored.get(option_id, each_option_default['default_value'])
            if each_option_default.get('required') and option_id not in stored:
                self.errors.append(f"Option '{option_id}' required but was not found to be set by the user. "
                                   f"Setting to default ({option_value}).")
            if option_type == 'integer':
                self.options[option_id] = int(option_value)
            elif option_type == 'float':
                self.options[option_id] = float(option_value)
            elif option_type == 'bool':
                self.options[option_id] = option_value == 'true'
            elif option_type in ('text', 'select', 'multiline_text'):
                self.options[option_id] = str(option_value)
            elif option_type == 'select_measurement':
                parts = option_value.split(',') if option_id in stored else []
                self.options[f'{option_id}_device_id'] = parts[0] if len(parts) > 1 else None
                self.options[f'{option_id}_measurement_id'] = parts[1] if len(parts) > 1 else None
            elif option_type == 'select_device':
                self.options[f'{option_id}_id'] = str(option_value)
            else:
                self.errors.append(f"setup_custom_options_json() Unknown option type '{option_type}'")

    def _set_custom_option(self, controller, unique_id, option, value):
        self.store.row(controller, unique_id)[option] = value
        return value

    def _get_custom_option(self, controller, unique_id, option, default_return=None):
        return self.store.row(controller, unique_id).get(option, default_return)


class AbstractInput(AbstractBaseController):
    """Layer member: inputs persist their options in the Input table."""

    def set_custom_option(self, option, value):
        return self._set_custom_option('Input', self.unique_id, option, value)

    def get_custom_option(self, option, default_return=None):
        return self._get_custom_option('Input', self.unique_id, option, default_return)


class AbstractFunction(AbstractBaseController):
    """Layer member: functions persist their options in the CustomController table."""

    def set_custom_option(self, option, value):
        return self._set_custom_option('CustomController', self.unique_id, option, value)

    def get_custom_option(self, option, default_return=None):
        return self._get_custom_option('CustomController', self.unique_id, option, default_return)
