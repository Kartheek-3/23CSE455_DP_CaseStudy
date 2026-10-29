// Layer Supertype: daemon module base.
// Derived from mycodo/abstract_base_controller.py (AbstractBaseController.setup_custom_options_json,
// _set_custom_option, _get_custom_option) and its layer members mycodo/inputs/base_input.py (AbstractInput)
// and mycodo/functions/base_function.py (AbstractFunction). The DB-backed custom options become an
// in-memory OptionStore; parsed options go into `options` instead of setattr; stored values are text
// instead of JSON; logger.error calls are collected in `errors`; the configuration errors after which the
// source logs and returns now throw ConfigurationError.
#pragma once
#include <map>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct ConfigurationError : std::runtime_error { using std::runtime_error::runtime_error; };

// A parsed option value (C++14 has no std::variant/std::optional).
struct OptionValue {
    enum Type { None, Integer, Float, Bool, Text } type;
    long long integer;
    double number;
    bool flag;
    std::string text;
};

using OptionDef = std::map<std::string, std::string>;  // keys id, type, default_value, required (any may be absent)
using TextMap = std::map<std::string, std::string>;

// Stand-in for the custom_options column of each (table, unique_id) row.
class OptionStore {
public:
    TextMap& row(const std::string& table, const std::string& unique_id) { return rows_[{table, unique_id}]; }

private:
    std::map<std::pair<std::string, std::string>, TextMap> rows_;
};

// Layer supertype: behaviour shared by every daemon-side module type; does not own the store.
class AbstractBaseController {
public:
    AbstractBaseController(std::string unique_id, OptionStore& store) : unique_id(std::move(unique_id)), store_(store) {}
    virtual ~AbstractBaseController() = default;

    void setup_custom_options(const std::vector<OptionDef>& custom_options, const TextMap& stored) {
        for (const OptionDef& def : custom_options) {
            if (!def.count("type")) throw ConfigurationError("'type' not found in custom_options");
            const std::string type = def.at("type");
            if (!def.count("id") && type != "new_line" && type != "message") throw ConfigurationError("'id' not found in custom_options");
            if (!def.count("default_value") && type != "new_line") throw ConfigurationError("'default_value' not found in custom_options");
            if (type == "new_line" || type == "message") continue;
            const std::string id = def.at("id");
            const bool is_stored = stored.count(id) > 0;
            const std::string value = is_stored ? stored.at(id) : def.at("default_value");
            if (def.count("required") && def.at("required") == "true" && !is_stored)
                errors.push_back("Option '" + id + "' required but was not found to be set by the user. Setting to default (" + value + ").");
            if (type == "integer") options[id] = {OptionValue::Integer, std::stoll(value), 0, false, ""};
            else if (type == "float") options[id] = {OptionValue::Float, 0, std::stod(value), false, ""};
            else if (type == "bool") options[id] = {OptionValue::Bool, 0, 0, value == "true", ""};
            else if (type == "text" || type == "select" || type == "multiline_text") options[id] = text(value);
            else if (type == "select_measurement") {
                const std::size_t comma = is_stored ? value.find(',') : std::string::npos;
                const bool split = comma != std::string::npos;
                options[id + "_device_id"] = split ? text(value.substr(0, comma)) : none();
                options[id + "_measurement_id"] = split ? text(value.substr(comma + 1, value.find(',', comma + 1) - comma - 1)) : none();
            } else if (type == "select_device") options[id + "_id"] = text(value);
            else errors.push_back("setup_custom_options_json() Unknown option type '" + type + "'");
        }
    }

    const std::string unique_id;
    std::map<std::string, OptionValue> options;
    std::vector<std::string> errors;

protected:
    std::string set_custom_option_for(const std::string& controller, const std::string& option, const std::string& value) {
        store_.row(controller, unique_id)[option] = value;
        return value;
    }
    // Returns false (None) when the option is not stored.
    bool get_custom_option_for(const std::string& controller, const std::string& option, std::string& out) {
        const TextMap& row = store_.row(controller, unique_id);
        const auto found = row.find(option);
        if (found == row.end()) return false;
        out = found->second;
        return true;
    }

private:
    static OptionValue text(const std::string& value) { return {OptionValue::Text, 0, 0, false, value}; }
    static OptionValue none() { return {OptionValue::None, 0, 0, false, ""}; }
    OptionStore& store_;
};

// Layer member: inputs persist their options in the Input table.
class AbstractInput : public AbstractBaseController {
public:
    using AbstractBaseController::AbstractBaseController;
    std::string set_custom_option(const std::string& option, const std::string& value) { return set_custom_option_for("Input", option, value); }
    bool get_custom_option(const std::string& option, std::string& out) { return get_custom_option_for("Input", option, out); }
};

// Layer member: functions persist their options in the CustomController table.
class AbstractFunction : public AbstractBaseController {
public:
    using AbstractBaseController::AbstractBaseController;
    std::string set_custom_option(const std::string& option, const std::string& value) { return set_custom_option_for("CustomController", option, value); }
    bool get_custom_option(const std::string& option, std::string& out) { return get_custom_option_for("CustomController", option, out); }
};
