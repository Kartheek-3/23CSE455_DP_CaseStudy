'use strict';
/**
 * Adapter: sensor driver adaptation. Target = AbstractInput.
 * Derived from mycodo/inputs/base_input.py (AbstractInput.get_measurement / value_set / is_enabled),
 * mycodo/inputs/adafruit_i2c_soil.py and mycodo/inputs/weather_openweathermap_weather.py (InputModule),
 * and mycodo/inputs/sensorutils.py (calculate_dewpoint). The adaptees (adafruit Seesaw I2C driver,
 * OpenWeatherMap HTTP API) are replaced by in-memory stand-ins with the same method names.
 */

/** Adaptee stand-in for adafruit_seesaw.seesaw.Seesaw; a raw value 'IOERROR' fails the read. */
class Seesaw {
  constructor(raw) {
    this.raw = raw;
  }

  read(key) {
    if (this.raw[key] === 'IOERROR') throw new Error(`I2C read of ${key} failed`);
    return Number(this.raw[key]);
  }

  moistureRead() { return this.read('moisture'); }

  getTemp() { return this.read('temp'); }
}

/** Adaptee stand-in for requests.get(url).json() against the OpenWeatherMap API. */
class WeatherApi {
  constructor(response, networkUp = true) {
    Object.assign(this, { response, networkUp, lastUrl: null });
  }

  get(url) {
    this.lastUrl = url;
    if (!this.networkUp) throw new Error('network unreachable');
    return { ...this.response };
  }
}

function calculateDewpoint(tempC, hum) {
  const [tn, m] = tempC >= 0 ? [243.12, 17.62] : [272.62, 22.46];
  if (hum / 100.0 <= 0) return 0.0;
  const logH = Math.log(hum / 100.0);
  return (tn * (logH + (m * tempC) / (tn + tempC))) / (m - logH - (m * tempC) / (tn + tempC));
}

/** Parse a response number like Python float(): throw on missing or non-numeric text. */
function toFloat(text) {
  const value = Number(text);
  if (text === undefined || String(text).trim() === '' || Number.isNaN(value)) throw new Error(`could not convert '${text}'`);
  return value;
}

/** Target: getMeasurement() returns a Map channel -> value, or null. */
class AbstractInput {
  constructor(enabledChannels) {
    this.enabledChannels = new Set(enabledChannels);
    this.returnDict = new Map();
  }

  isEnabled(channel) { return this.enabledChannels.has(channel); }

  valueSet(chan, value) {
    if (value === null || value === undefined || !this.isEnabled(chan)) return;
    this.returnDict.set(chan, Number(value));
  }

  getMeasurement() { throw new Error('getMeasurement() must be overridden'); }
}

/** Adapter for the capacitive soil sensor (adafruit_i2c_soil.InputModule). */
class SoilInput extends AbstractInput {
  constructor(enabledChannels, sensor = null) {
    super(enabledChannels);
    this.sensor = sensor;
  }

  getMeasurement() {
    if (!this.sensor) return null;
    this.returnDict = new Map();
    if (this.isEnabled(0)) this.valueSet(0, this.sensor.moistureRead());
    if (this.isEnabled(1)) this.valueSet(1, this.sensor.getTemp());
    return this.returnDict;
  }
}

/** Adapter for the city weather API (weather_openweathermap_weather.InputModule). */
class WeatherInput extends AbstractInput {
  constructor(enabledChannels, api, apiKey, city) {
    super(enabledChannels);
    this.api = api;
    this.apiUrl = apiKey && city
      ? `http://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric&q=${city}` : null;
  }

  getMeasurement() {
    if (!this.apiUrl) return null;
    this.returnDict = new Map();
    let temperature; let humidity; let pressure; let windSpeed; let windDeg;
    try {
      const x = this.api.get(this.apiUrl);
      if (x.cod === '404') return null;
      [temperature, humidity, pressure] = [toFloat(x.temp), toFloat(x.humidity), toFloat(x.pressure)];
      [windSpeed, windDeg] = [toFloat(x.wind_speed), toFloat(x.wind_deg)];
    } catch (err) {
      return null;
    }
    this.valueSet(0, temperature);
    this.valueSet(1, humidity);
    this.valueSet(2, pressure);
    if (this.isEnabled(0) && this.isEnabled(1) && this.isEnabled(3)) this.valueSet(3, calculateDewpoint(temperature, humidity));
    this.valueSet(4, windSpeed);
    this.valueSet(5, windDeg);
    return this.returnDict;
  }
}

/** Client: reads a measurement through the Target interface only. */
const updateMeasure = (inputDevice) => inputDevice.getMeasurement();

module.exports = { Seesaw, WeatherApi, AbstractInput, SoilInput, WeatherInput, calculateDewpoint, updateMeasure };
