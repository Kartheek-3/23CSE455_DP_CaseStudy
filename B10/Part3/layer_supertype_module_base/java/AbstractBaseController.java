import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Layer Supertype: daemon module base.
 * Derived from mycodo/abstract_base_controller.py (AbstractBaseController.setup_custom_options_json,
 * _set_custom_option, _get_custom_option) and its layer members mycodo/inputs/base_input.py (AbstractInput)
 * and mycodo/functions/base_function.py (AbstractFunction). The DB-backed custom options become an
 * in-memory OptionStore; parsed options go into `options` instead of setattr; stored values are text
 * instead of JSON; logger.error calls are collected in `errors`; the configuration errors after which the
 * source logs and returns now throw ConfigurationError.
 */
public abstract class AbstractBaseController {
    final String uniqueId;
    final OptionStore store;
    final Map<String, Object> options = new HashMap<>();
    final List<String> errors = new ArrayList<>();

    protected AbstractBaseController(String uniqueId, OptionStore store) {
        this.uniqueId = uniqueId;
        this.store = store;
    }

    /** Each option definition is a map with the keys id, type, default_value, required (any may be absent). */
    public void setupCustomOptions(List<Map<String, String>> customOptions, Map<String, String> stored) {
        for (Map<String, String> def : customOptions) {
            String type = def.get("type"), id = def.get("id");
            if (type == null) throw new ConfigurationError("'type' not found in custom_options: " + def);
            if (id == null && !type.equals("new_line") && !type.equals("message"))
                throw new ConfigurationError("'id' not found in custom_options: " + def);
            if (!def.containsKey("default_value") && !type.equals("new_line"))
                throw new ConfigurationError("'default_value' not found in custom_options: " + def);
            if (type.equals("new_line") || type.equals("message")) continue;
            String value = stored.getOrDefault(id, def.get("default_value"));
            if ("true".equals(def.get("required")) && !stored.containsKey(id))
                errors.add("Option '" + id + "' required but was not found to be set by the user. Setting to default (" + value + ").");
            switch (type) {
                case "integer": options.put(id, Long.parseLong(value)); break;
                case "float": options.put(id, Double.parseDouble(value)); break;
                case "bool": options.put(id, value.equals("true")); break;
                case "text": case "select": case "multiline_text": options.put(id, value); break;
                case "select_measurement":
                    List<String> parts = stored.containsKey(id) ? Arrays.asList(value.split(",", -1)) : new ArrayList<>();
                    options.put(id + "_device_id", parts.size() > 1 ? parts.get(0) : null);
                    options.put(id + "_measurement_id", parts.size() > 1 ? parts.get(1) : null);
                    break;
                case "select_device": options.put(id + "_id", value); break;
                default: errors.add("setup_custom_options_json() Unknown option type '" + type + "'");
            }
        }
    }

    protected String setCustomOption(String controller, String uniqueId, String option, String value) {
        store.row(controller, uniqueId).put(option, value);
        return value;
    }

    protected String getCustomOption(String controller, String uniqueId, String option, String defaultReturn) {
        return store.row(controller, uniqueId).getOrDefault(option, defaultReturn);
    }
}

class ConfigurationError extends RuntimeException {
    ConfigurationError(String message) { super(message); }
}

/** Stand-in for the custom_options column of each (table, unique_id) row. */
class OptionStore {
    private final Map<String, Map<String, String>> rows = new HashMap<>();

    Map<String, String> row(String table, String uniqueId) {
        return rows.computeIfAbsent(table + "#" + uniqueId, k -> new HashMap<>());
    }
}

/** Layer member: inputs persist their options in the Input table. */
class AbstractInput extends AbstractBaseController {
    AbstractInput(String uniqueId, OptionStore store) { super(uniqueId, store); }

    String setCustomOption(String option, String value) { return setCustomOption("Input", uniqueId, option, value); }

    String getCustomOption(String option) { return getCustomOption("Input", uniqueId, option, null); }
}

/** Layer member: functions persist their options in the CustomController table. */
class AbstractFunction extends AbstractBaseController {
    AbstractFunction(String uniqueId, OptionStore store) { super(uniqueId, store); }

    String setCustomOption(String option, String value) { return setCustomOption("CustomController", uniqueId, option, value); }

    String getCustomOption(String option) { return getCustomOption("CustomController", uniqueId, option, null); }
}
