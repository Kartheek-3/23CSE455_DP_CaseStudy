"""Plugin: input module loading.

Derived from mycodo/utils/modules.py (load_module_from_file), mycodo/utils/inputs.py
(parse_input_information) and mycodo/controllers/controller_input.py (InputController.initialize_variables
loading and instantiating InputModule). Files on disk plus importlib are replaced by an in-memory
catalogue of module "files" (MODULE_CATALOG); each loaded module exposes INPUT_INFORMATION and InputModule.
"""

EXCLUDED_FILES = ['__init__.py', '__pycache__', 'base_input.py', 'custom_inputs',
                  'examples', 'scripts', 'tmp_inputs', 'sensorutils.py']


class AbstractInput:
    """Plugin interface: every InputModule derives from it."""
    INPUT_INFORMATION = {}

    def __init__(self, input_dev):
        self.input_dev = input_dev

    def describe(self):
        info = self.INPUT_INFORMATION
        return f"{info['input_manufacturer']} {info['input_name_short']}"


class SoilInputModule(AbstractInput):
    INPUT_INFORMATION = {'input_name_unique': 'ADAFRUIT_I2C_SOIL', 'input_manufacturer': 'Adafruit',
                         'input_name_short': 'Capacitive Moisture'}


class WeatherInputModule(AbstractInput):
    INPUT_INFORMATION = {'input_name_unique': 'OPENWEATHERMAP_CALL_WEATHER', 'input_manufacturer': 'Weather',
                         'input_name_short': 'OpenWeather City'}


class PluginModule:
    """A loaded module: INPUT_INFORMATION (or None) and its InputModule class."""

    def __init__(self, input_information=None, input_module=None):
        self.INPUT_INFORMATION = input_information
        self.InputModule = input_module


def _broken_module():
    raise ImportError("No module named 'adafruit_seesaw'")


MODULE_CATALOG = {
    'adafruit_i2c_soil.py': lambda: PluginModule(SoilInputModule.INPUT_INFORMATION, SoilInputModule),
    'weather_openweathermap_weather.py': lambda: PluginModule(WeatherInputModule.INPUT_INFORMATION, WeatherInputModule),
    'soil_copy.py': lambda: PluginModule(SoilInputModule.INPUT_INFORMATION, SoilInputModule),
    'input_helpers.py': lambda: PluginModule(),
    'broken_input.py': _broken_module,
    'bad_info.py': lambda: PluginModule({'input_manufacturer': 'Nobody'}, AbstractInput),
}


def load_module_from_file(path_file):
    """Loader: returns the module, or None if it cannot be loaded."""
    try:
        return MODULE_CATALOG[path_file.split('/')[-1]]()
    except Exception:
        return None


def parse_input_information(files):
    """Registry: input_name_unique -> {file_path, ...}; also returns the duplicate-name errors."""
    dict_inputs, errors = {}, []
    for each_file in files:
        if each_file in EXCLUDED_FILES:
            continue
        full_path = f'inputs/{each_file}'
        input_custom = load_module_from_file(full_path)
        if not input_custom or input_custom.INPUT_INFORMATION is None:
            continue
        name = input_custom.INPUT_INFORMATION['input_name_unique']
        if name in dict_inputs:
            errors.append(f'Cannot add input modules because it does not have a unique name: {name}')
        else:
            dict_inputs[name] = {}
        dict_inputs[name]['file_path'] = full_path
        for key in ('input_manufacturer', 'input_name_short'):
            if key in input_custom.INPUT_INFORMATION:
                dict_inputs[name][key] = input_custom.INPUT_INFORMATION[key]
    return dict_inputs, errors


class InputController:
    """Host: loads the module registered for a device and instantiates its InputModule."""

    def __init__(self, dict_inputs):
        self.dict_inputs = dict_inputs

    def initialize(self, device, input_dev=None):
        if device not in self.dict_inputs:
            raise LookupError(f"'{device}' is not a valid device type.")
        input_loaded = load_module_from_file(self.dict_inputs[device]['file_path'])
        return input_loaded.InputModule(input_dev) if input_loaded else None
