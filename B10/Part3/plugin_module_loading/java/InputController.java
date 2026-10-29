import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Plugin: input module loading. InputController is the host.
 * Derived from mycodo/utils/modules.py (load_module_from_file), mycodo/utils/inputs.py
 * (parse_input_information) and mycodo/controllers/controller_input.py (InputController.initialize_variables
 * loading and instantiating InputModule). Files on disk plus importlib are replaced by an in-memory
 * catalogue of module "files" (MODULE_CATALOG); each loaded module exposes INPUT_INFORMATION and InputModule.
 */
public class InputController {
    static final List<String> EXCLUDED_FILES = Arrays.asList("__init__.py", "__pycache__", "base_input.py",
            "custom_inputs", "examples", "scripts", "tmp_inputs", "sensorutils.py");

    static final Map<String, Supplier<PluginModule>> MODULE_CATALOG = new HashMap<>();
    static {
        MODULE_CATALOG.put("adafruit_i2c_soil.py", () -> new PluginModule(SoilInputModule.INFO, SoilInputModule::new));
        MODULE_CATALOG.put("weather_openweathermap_weather.py", () -> new PluginModule(WeatherInputModule.INFO, WeatherInputModule::new));
        MODULE_CATALOG.put("soil_copy.py", () -> new PluginModule(SoilInputModule.INFO, SoilInputModule::new));
        MODULE_CATALOG.put("input_helpers.py", () -> new PluginModule(null, null));
        MODULE_CATALOG.put("broken_input.py", () -> { throw new IllegalStateException("No module named 'adafruit_seesaw'"); });
        MODULE_CATALOG.put("bad_info.py", () -> new PluginModule(Map.of("input_manufacturer", "Nobody"), null));
    }

    private final Map<String, Map<String, String>> dictInputs;

    InputController(Map<String, Map<String, String>> dictInputs) {
        this.dictInputs = dictInputs;
    }

    /** Loader: returns the module, or null if it cannot be loaded. */
    static PluginModule loadModuleFromFile(String pathFile) {
        try {
            return MODULE_CATALOG.get(pathFile.substring(pathFile.lastIndexOf('/') + 1)).get();
        } catch (RuntimeException e) {
            return null;
        }
    }

    /** Registry: input_name_unique -> {file_path, ...}; duplicate-name errors are added to `errors`. */
    static Map<String, Map<String, String>> parseInputInformation(List<String> files, List<String> errors) {
        Map<String, Map<String, String>> dictInputs = new LinkedHashMap<>();
        for (String eachFile : files) {
            if (EXCLUDED_FILES.contains(eachFile)) continue;
            String fullPath = "inputs/" + eachFile;
            PluginModule inputCustom = loadModuleFromFile(fullPath);
            if (inputCustom == null || inputCustom.inputInformation == null) continue;
            String name = inputCustom.inputInformation.get("input_name_unique");
            if (name == null) throw new NoSuchElementException("'input_name_unique'");
            if (dictInputs.containsKey(name)) {
                errors.add("Cannot add input modules because it does not have a unique name: " + name);
            } else {
                dictInputs.put(name, new HashMap<>());
            }
            dictInputs.get(name).put("file_path", fullPath);
            for (String key : new String[] {"input_manufacturer", "input_name_short"}) {
                if (inputCustom.inputInformation.containsKey(key)) dictInputs.get(name).put(key, inputCustom.inputInformation.get(key));
            }
        }
        return dictInputs;
    }

    /** Host: loads the module registered for a device and instantiates its InputModule. */
    AbstractInput initialize(String device, String inputDev) {
        if (!dictInputs.containsKey(device)) throw new NoSuchElementException("'" + device + "' is not a valid device type.");
        PluginModule inputLoaded = loadModuleFromFile(dictInputs.get(device).get("file_path"));
        return inputLoaded != null ? inputLoaded.inputModule.apply(inputDev) : null;
    }
}

/** Plugin interface: every InputModule derives from it. */
abstract class AbstractInput {
    final String inputDev;

    AbstractInput(String inputDev) { this.inputDev = inputDev; }

    abstract Map<String, String> inputInformation();

    String describe() {
        return inputInformation().get("input_manufacturer") + " " + inputInformation().get("input_name_short");
    }
}

class SoilInputModule extends AbstractInput {
    static final Map<String, String> INFO = Map.of("input_name_unique", "ADAFRUIT_I2C_SOIL",
            "input_manufacturer", "Adafruit", "input_name_short", "Capacitive Moisture");

    SoilInputModule(String inputDev) { super(inputDev); }

    Map<String, String> inputInformation() { return INFO; }
}

class WeatherInputModule extends AbstractInput {
    static final Map<String, String> INFO = Map.of("input_name_unique", "OPENWEATHERMAP_CALL_WEATHER",
            "input_manufacturer", "Weather", "input_name_short", "OpenWeather City");

    WeatherInputModule(String inputDev) { super(inputDev); }

    Map<String, String> inputInformation() { return INFO; }
}

/** A loaded module: INPUT_INFORMATION (or null) and its InputModule constructor. */
final class PluginModule {
    final Map<String, String> inputInformation;
    final Function<String, AbstractInput> inputModule;

    PluginModule(Map<String, String> inputInformation, Function<String, AbstractInput> inputModule) {
        this.inputInformation = inputInformation;
        this.inputModule = inputModule;
    }
}
