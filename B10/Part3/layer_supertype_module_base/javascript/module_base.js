'use strict';
/**
 * Layer Supertype: daemon module base.
 * Derived from mycodo/abstract_base_controller.py (AbstractBaseController.setup_custom_options_json,
 * _set_custom_option, _get_custom_option) and its layer members mycodo/inputs/base_input.py (AbstractInput)
 * and mycodo/functions/base_function.py (AbstractFunction). The DB-backed custom options become an
 * in-memory OptionStore; parsed options go into `options` instead of setattr; stored values are text
 * instead of JSON; logger.error calls are collected in `errors`; the configuration errors after which the
 * source logs and returns now throw ConfigurationError.
 */

class ConfigurationError extends Error {}

/** Stand-in for the custom_options column of each (table, unique_id) row. */
class OptionStore {
  constructor() {
    this.rows = new Map();
  }

  row(table, uniqueId) {
    const key = `${table}#${uniqueId}`;
    if (!this.rows.has(key)) this.rows.set(key, new Map());
    return this.rows.get(key);
  }
}

/** Python-like int()/float(): reject empty or non-numeric text. */
function toNumber(text, integer) {
  const valid = integer ? /^\s*[-+]?\d+\s*$/ : /^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?\s*$/;
  if (!valid.test(text)) throw new Error(`invalid literal: '${text}'`);
  return Number(text);
}

/** Layer supertype: behaviour shared by every daemon-side module type. */
class AbstractBaseController {
  constructor(uniqueId, store) {
    Object.assign(this, { uniqueId, store, options: {}, errors: [] });
  }

  setupCustomOptions(customOptions, stored) {
    for (const def of customOptions) {
      const { type, id } = def;
      if (type === undefined) throw new ConfigurationError(`'type' not found in custom_options: ${JSON.stringify(def)}`);
      if (id === undefined && type !== 'new_line' && type !== 'message') throw new ConfigurationError(`'id' not found in custom_options: ${JSON.stringify(def)}`);
      if (!('default_value' in def) && type !== 'new_line') throw new ConfigurationError(`'default_value' not found in custom_options: ${JSON.stringify(def)}`);
      if (type === 'new_line' || type === 'message') continue;
      const isStored = Object.prototype.hasOwnProperty.call(stored, id);
      const value = isStored ? stored[id] : def.default_value;
      if (def.required && !isStored) {
        this.errors.push(`Option '${id}' required but was not found to be set by the user. Setting to default (${value}).`);
      }
      if (type === 'integer') this.options[id] = toNumber(value, true);
      else if (type === 'float') this.options[id] = toNumber(value, false);
      else if (type === 'bool') this.options[id] = value === 'true';
      else if (['text', 'select', 'multiline_text'].includes(type)) this.options[id] = String(value);
      else if (type === 'select_measurement') {
        const parts = isStored ? value.split(',') : [];
        this.options[`${id}_device_id`] = parts.length > 1 ? parts[0] : null;
        this.options[`${id}_measurement_id`] = parts.length > 1 ? parts[1] : null;
      } else if (type === 'select_device') this.options[`${id}_id`] = String(value);
      else this.errors.push(`setup_custom_options_json() Unknown option type '${type}'`);
    }
  }

  setCustomOptionFor(controller, uniqueId, option, value) {
    this.store.row(controller, uniqueId).set(option, value);
    return value;
  }

  getCustomOptionFor(controller, uniqueId, option, defaultReturn = null) {
    const row = this.store.row(controller, uniqueId);
    return row.has(option) ? row.get(option) : defaultReturn;
  }
}

/** Layer member: inputs persist their options in the Input table. */
class AbstractInput extends AbstractBaseController {
  setCustomOption(option, value) { return this.setCustomOptionFor('Input', this.uniqueId, option, value); }

  getCustomOption(option, defaultReturn = null) { return this.getCustomOptionFor('Input', this.uniqueId, option, defaultReturn); }
}

/** Layer member: functions persist their options in the CustomController table. */
class AbstractFunction extends AbstractBaseController {
  setCustomOption(option, value) { return this.setCustomOptionFor('CustomController', this.uniqueId, option, value); }

  getCustomOption(option, defaultReturn = null) {
    return this.getCustomOptionFor('CustomController', this.uniqueId, option, defaultReturn);
  }
}

module.exports = { ConfigurationError, OptionStore, AbstractBaseController, AbstractInput, AbstractFunction };
