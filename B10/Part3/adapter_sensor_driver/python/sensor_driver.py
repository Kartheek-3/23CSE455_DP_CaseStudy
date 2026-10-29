"""Adapter: sensor driver adaptation.

Derived from mycodo/inputs/base_input.py (AbstractInput.get_measurement / value_set / is_enabled),
mycodo/inputs/adafruit_i2c_soil.py and mycodo/inputs/weather_openweathermap_weather.py (InputModule),
and mycodo/inputs/sensorutils.py (calculate_dewpoint). The adaptees (adafruit Seesaw I2C driver,
OpenWeatherMap HTTP API) are replaced by in-memory stand-ins with the same method names.
"""
import math


class Seesaw:
    """Adaptee stand-in for adafruit_seesaw.seesaw.Seesaw; a raw value 'IOERROR' fails the read."""

    def __init__(self, raw):
        self.raw = raw

    def _read(self, key):
        if self.raw[key] == 'IOERROR':
            raise IOError(f'I2C read of {key} failed')
        return float(self.raw[key])

    def moisture_read(self):
        return self._read('moisture')

    def get_temp(self):
        return self._read('temp')


class WeatherApi:
    """Adaptee stand-in for requests.get(url).json() against the OpenWeatherMap API."""

    def __init__(self, response, network_up=True):
        self.response, self.network_up, self.last_url = response, network_up, None

    def get(self, url):
        self.last_url = url
        if not self.network_up:
            raise ConnectionError('network unreachable')
        return dict(self.response)


def calculate_dewpoint(temp_c, hum):
    tn, m = (243.12, 17.62) if temp_c >= 0 else (272.62, 22.46)
    if hum / 100.0 <= 0:
        return 0.0
    log_h = math.log(hum / 100.0)
    return tn * (log_h + (m * temp_c) / (tn + temp_c)) / (m - log_h - m * temp_c / (tn + temp_c))


class AbstractInput:
    """Target: get_measurement() returns {channel: value} or None."""

    def __init__(self, enabled_channels):
        self.enabled_channels = set(enabled_channels)
        self.return_dict = {}

    def is_enabled(self, channel):
        return channel in self.enabled_channels

    def value_set(self, chan, value):
        if value is None or not self.is_enabled(chan):
            return
        self.return_dict[chan] = float(value)

    def get_measurement(self):
        raise NotImplementedError


class SoilInput(AbstractInput):
    """Adapter for the capacitive soil sensor (adafruit_i2c_soil.InputModule)."""

    def __init__(self, enabled_channels, sensor=None):
        super().__init__(enabled_channels)
        self.sensor = sensor

    def get_measurement(self):
        if not self.sensor:
            return None
        self.return_dict = {}
        if self.is_enabled(0):
            self.value_set(0, self.sensor.moisture_read())
        if self.is_enabled(1):
            self.value_set(1, self.sensor.get_temp())
        return self.return_dict


class WeatherInput(AbstractInput):
    """Adapter for the city weather API (weather_openweathermap_weather.InputModule)."""

    def __init__(self, enabled_channels, api, api_key, city):
        super().__init__(enabled_channels)
        self.api = api
        self.api_url = None
        if api_key and city:
            self.api_url = f'http://api.openweathermap.org/data/2.5/weather?appid={api_key}&units=metric&q={city}'

    def get_measurement(self):
        if not self.api_url:
            return None
        self.return_dict = {}
        try:
            x = self.api.get(self.api_url)
            if x['cod'] == '404':
                return None
            temperature, humidity = float(x['temp']), float(x['humidity'])
            pressure, wind_speed, wind_deg = float(x['pressure']), float(x['wind_speed']), float(x['wind_deg'])
        except Exception:
            return None
        self.value_set(0, temperature)
        self.value_set(1, humidity)
        self.value_set(2, pressure)
        if self.is_enabled(0) and self.is_enabled(1) and self.is_enabled(3):
            self.value_set(3, calculate_dewpoint(temperature, humidity))
        self.value_set(4, wind_speed)
        self.value_set(5, wind_deg)
        return self.return_dict


def update_measure(input_device):
    """Client: reads a measurement through the Target interface only."""
    return input_device.get_measurement()
