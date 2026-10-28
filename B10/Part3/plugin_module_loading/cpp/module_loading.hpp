// Plugin: input module loading. InputController is the host.
// Derived from mycodo/utils/modules.py (load_module_from_file), mycodo/utils/inputs.py
// (parse_input_information) and mycodo/controllers/controller_input.py (InputController.initialize_variables
// loading and instantiating InputModule). Files on disk plus importlib are replaced by an in-memory
// catalogue of module "files" (module_catalog()); each loaded module exposes INPUT_INFORMATION and InputModule.
#pragma once
#include <algorithm>
#include <functional>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

using Info = std::map<std::string, std::string>;

// Plugin interface: every InputModule derives from it.
class AbstractInput {
public:
    explicit AbstractInput(std::string input_dev) : input_dev(std::move(input_dev)) {}
    virtual ~AbstractInput() = default;
    virtual const Info& input_information() const = 0;
    std::string describe() const {
        return input_information().at("input_manufacturer") + " " + input_information().at("input_name_short");
    }
    const std::string input_dev;
};

class SoilInputModule : public AbstractInput {
public:
    using AbstractInput::AbstractInput;
    static const Info& info() {
        static const Info i{{"input_name_unique", "ADAFRUIT_I2C_SOIL"}, {"input_manufacturer", "Adafruit"},
                            {"input_name_short", "Capacitive Moisture"}};
        return i;
    }
    const Info& input_information() const override { return info(); }
};

class WeatherInputModule : public AbstractInput {
public:
    using AbstractInput::AbstractInput;
    static const Info& info() {
        static const Info i{{"input_name_unique", "OPENWEATHERMAP_CALL_WEATHER"}, {"input_manufacturer", "Weather"},
                            {"input_name_short", "OpenWeather City"}};
        return i;
    }
    const Info& input_information() const override { return info(); }
};

// A loaded module: INPUT_INFORMATION (has_information == false = None) and its InputModule factory.
struct PluginModule {
    bool has_information;
    Info input_information;
    std::function<std::unique_ptr<AbstractInput>(const std::string&)> input_module;
};

template <typename T>
std::unique_ptr<AbstractInput> make_input(const std::string& input_dev) { return std::unique_ptr<AbstractInput>(new T(input_dev)); }

inline const std::map<std::string, std::function<PluginModule()>>& module_catalog() {
    static const std::map<std::string, std::function<PluginModule()>> catalog{
        {"adafruit_i2c_soil.py", [] { return PluginModule{true, SoilInputModule::info(), make_input<SoilInputModule>}; }},
        {"weather_openweathermap_weather.py", [] { return PluginModule{true, WeatherInputModule::info(), make_input<WeatherInputModule>}; }},
        {"soil_copy.py", [] { return PluginModule{true, SoilInputModule::info(), make_input<SoilInputModule>}; }},
        {"input_helpers.py", [] { return PluginModule{false, {}, nullptr}; }},
        {"broken_input.py", []() -> PluginModule { throw std::runtime_error("No module named 'adafruit_seesaw'"); }},
        {"bad_info.py", [] { return PluginModule{true, {{"input_manufacturer", "Nobody"}}, nullptr}; }}};
    return catalog;
}

// Loader: returns the module, or nullptr if it cannot be loaded.
inline std::unique_ptr<PluginModule> load_module_from_file(const std::string& path_file) {
    try {
        const std::string file = path_file.substr(path_file.rfind('/') + 1);
        return std::unique_ptr<PluginModule>(new PluginModule(module_catalog().at(file)()));
    } catch (const std::exception&) {
        return nullptr;
    }
}

using Registry = std::map<std::string, Info>;

// Registry: input_name_unique -> {file_path, ...}; duplicate-name errors are appended to `errors`.
inline Registry parse_input_information(const std::vector<std::string>& files, std::vector<std::string>& errors) {
    static const std::vector<std::string> excluded{"__init__.py", "__pycache__", "base_input.py", "custom_inputs",
                                                   "examples", "scripts", "tmp_inputs", "sensorutils.py"};
    Registry dict_inputs;
    for (const std::string& each_file : files) {
        if (std::find(excluded.begin(), excluded.end(), each_file) != excluded.end()) continue;
        const std::string full_path = "inputs/" + each_file;
        const std::unique_ptr<PluginModule> input_custom = load_module_from_file(full_path);
        if (!input_custom || !input_custom->has_information) continue;
        const std::string name = input_custom->input_information.at("input_name_unique");  // throws if missing
        if (dict_inputs.count(name)) errors.push_back("Cannot add input modules because it does not have a unique name: " + name);
        dict_inputs[name]["file_path"] = full_path;
        for (const char* key : {"input_manufacturer", "input_name_short"})
            if (input_custom->input_information.count(key)) dict_inputs[name][key] = input_custom->input_information.at(key);
    }
    return dict_inputs;
}

// Host: loads the module registered for a device and instantiates its InputModule.
class InputController {
public:
    explicit InputController(Registry dict_inputs) : dict_inputs_(std::move(dict_inputs)) {}
    std::unique_ptr<AbstractInput> initialize(const std::string& device, const std::string& input_dev = "") const {
        const auto found = dict_inputs_.find(device);
        if (found == dict_inputs_.end()) throw std::out_of_range("'" + device + "' is not a valid device type.");
        const std::unique_ptr<PluginModule> input_loaded = load_module_from_file(found->second.at("file_path"));
        return input_loaded ? input_loaded->input_module(input_dev) : nullptr;
    }

private:
    Registry dict_inputs_;
};
