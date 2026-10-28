'use strict';
/**
 * Plugin: input module loading. InputController is the host.
 * Derived from mycodo/utils/modules.py (load_module_from_file), mycodo/utils/inputs.py
 * (parse_input_information) and mycodo/controllers/controller_input.py (InputController.initialize_variables
 * loading and instantiating InputModule). Files on disk plus importlib are replaced by an in-memory
 * catalogue of module "files" (MODULE_CATALOG); each loaded module exposes INPUT_INFORMATION and InputModule.
 */

const EXCLUDED_FILES = ['__init__.py', '__pycache__', 'base_input.py', 'custom_inputs',
  'examples', 'scripts', 'tmp_inputs', 'sensorutils.py'];

/** Plugin interface: every InputModule derives from it. */
class AbstractInput {
  constructor(inputDev) {
    this.inputDev = inputDev;
  }

  describe() {
    const info = this.constructor.INPUT_INFORMATION;
    return `${info.input_manufacturer} ${info.input_name_short}`;
  }
}

class SoilInputModule extends AbstractInput {
  static INPUT_INFORMATION = { input_name_unique: 'ADAFRUIT_I2C_SOIL', input_manufacturer: 'Adafruit',
    input_name_short: 'Capacitive Moisture' };
}

class WeatherInputModule extends AbstractInput {
  static INPUT_INFORMATION = { input_name_unique: 'OPENWEATHERMAP_CALL_WEATHER', input_manufacturer: 'Weather',
    input_name_short: 'OpenWeather City' };
}

/** A loaded module: INPUT_INFORMATION (or null) and its InputModule class. */
class PluginModule {
  constructor(inputInformation = null, inputModule = null) {
    this.INPUT_INFORMATION = inputInformation;
    this.InputModule = inputModule;
  }
}

const MODULE_CATALOG = {
  'adafruit_i2c_soil.py': () => new PluginModule(SoilInputModule.INPUT_INFORMATION, SoilInputModule),
  'weather_openweathermap_weather.py': () => new PluginModule(WeatherInputModule.INPUT_INFORMATION, WeatherInputModule),
  'soil_copy.py': () => new PluginModule(SoilInputModule.INPUT_INFORMATION, SoilInputModule),
  'input_helpers.py': () => new PluginModule(),
  'broken_input.py': () => { throw new Error("No module named 'adafruit_seesaw'"); },
  'bad_info.py': () => new PluginModule({ input_manufacturer: 'Nobody' }, AbstractInput),
};

/** Loader: returns the module, or null if it cannot be loaded. */
function loadModuleFromFile(pathFile) {
  try {
    return MODULE_CATALOG[pathFile.split('/').pop()]();
  } catch (err) {
    return null;
  }
}

/** Registry: input_name_unique -> {file_path, ...}; also returns the duplicate-name errors. */
function parseInputInformation(files) {
  const dictInputs = {};
  const errors = [];
  for (const eachFile of files) {
    if (EXCLUDED_FILES.includes(eachFile)) continue;
    const fullPath = `inputs/${eachFile}`;
    const inputCustom = loadModuleFromFile(fullPath);
    if (!inputCustom || inputCustom.INPUT_INFORMATION === null) continue;
    const info = inputCustom.INPUT_INFORMATION;
    if (!('input_name_unique' in info)) throw new Error("KeyError: 'input_name_unique'");
    const name = info.input_name_unique;
    if (name in dictInputs) errors.push(`Cannot add input modules because it does not have a unique name: ${name}`);
    else dictInputs[name] = {};
    dictInputs[name].file_path = fullPath;
    for (const key of ['input_manufacturer', 'input_name_short']) {
      if (key in info) dictInputs[name][key] = info[key];
    }
  }
  return [dictInputs, errors];
}

/** Host: loads the module registered for a device and instantiates its InputModule. */
class InputController {
  constructor(dictInputs) {
    this.dictInputs = dictInputs;
  }

  initialize(device, inputDev = null) {
    if (!(device in this.dictInputs)) throw new Error(`'${device}' is not a valid device type.`);
    const inputLoaded = loadModuleFromFile(this.dictInputs[device].file_path);
    return inputLoaded ? new inputLoaded.InputModule(inputDev) : null;
  }
}

module.exports = {
  AbstractInput, SoilInputModule, WeatherInputModule, PluginModule, MODULE_CATALOG,
  loadModuleFromFile, parseInputInformation, InputController,
};
