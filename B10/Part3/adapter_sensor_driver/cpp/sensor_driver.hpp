// Adapter: sensor driver adaptation. Target = AbstractInput.
// Derived from mycodo/inputs/base_input.py (AbstractInput.get_measurement / value_set / is_enabled),
// mycodo/inputs/adafruit_i2c_soil.py and mycodo/inputs/weather_openweathermap_weather.py (InputModule),
// and mycodo/inputs/sensorutils.py (calculate_dewpoint). The adaptees (adafruit Seesaw I2C driver,
// OpenWeatherMap HTTP API) are replaced by in-memory stand-ins with the same method names.
#pragma once
#include <cmath>
#include <map>
#include <memory>
#include <set>
#include <stdexcept>
#include <string>
#include <utility>

using RawMap = std::map<std::string, std::string>;

// Result of get_measurement(): has_value == false means None.
struct Measurements {
    bool has_value;
    std::map<int, double> values;
};

// Adaptee stand-in for adafruit_seesaw.seesaw.Seesaw; a raw value "IOERROR" fails the read.
class Seesaw {
public:
    explicit Seesaw(RawMap raw) : raw_(std::move(raw)) {}
    double moisture_read() const { return read("moisture"); }
    double get_temp() const { return read("temp"); }

private:
    double read(const std::string& key) const {
        if (raw_.at(key) == "IOERROR") throw std::runtime_error("I2C read of " + key + " failed");
        return std::stod(raw_.at(key));
    }
    RawMap raw_;
};

// Adaptee stand-in for requests.get(url).json() against the OpenWeatherMap API.
class WeatherApi {
public:
    WeatherApi(RawMap response, bool network_up) : response_(std::move(response)), network_up_(network_up) {}
    RawMap get(const std::string& url) {
        last_url = url;
        if (!network_up_) throw std::runtime_error("network unreachable");
        return response_;
    }
    std::string last_url;

private:
    RawMap response_;
    bool network_up_;
};

inline double calculate_dewpoint(double temp_c, double hum) {
    const double tn = temp_c >= 0 ? 243.12 : 272.62, m = temp_c >= 0 ? 17.62 : 22.46;
    if (hum / 100.0 <= 0) return 0.0;
    const double log_h = std::log(hum / 100.0);
    return tn * (log_h + (m * temp_c) / (tn + temp_c)) / (m - log_h - m * temp_c / (tn + temp_c));
}

// Target: get_measurement() returns channel -> value, or None.
class AbstractInput {
public:
    explicit AbstractInput(std::set<int> enabled_channels) : enabled_channels_(std::move(enabled_channels)) {}
    virtual ~AbstractInput() = default;
    virtual Measurements get_measurement() = 0;

protected:
    bool is_enabled(int channel) const { return enabled_channels_.count(channel) > 0; }
    void value_set(int chan, double value) {
        if (is_enabled(chan)) return_dict_[chan] = value;
    }
    std::map<int, double> return_dict_;

private:
    std::set<int> enabled_channels_;
};

// Adapter for the capacitive soil sensor (adafruit_i2c_soil.InputModule); does not own the sensor.
class SoilInput : public AbstractInput {
public:
    SoilInput(std::set<int> enabled_channels, const Seesaw* sensor)
        : AbstractInput(std::move(enabled_channels)), sensor_(sensor) {}
    Measurements get_measurement() override {
        if (!sensor_) return {false, {}};
        return_dict_.clear();
        if (is_enabled(0)) value_set(0, sensor_->moisture_read());
        if (is_enabled(1)) value_set(1, sensor_->get_temp());
        return {true, return_dict_};
    }

private:
    const Seesaw* sensor_;
};

// Adapter for the city weather API (weather_openweathermap_weather.InputModule); does not own the API.
class WeatherInput : public AbstractInput {
public:
    WeatherInput(std::set<int> enabled_channels, WeatherApi* api, const std::string& api_key, const std::string& city)
        : AbstractInput(std::move(enabled_channels)), api_(api) {
        if (!api_key.empty() && !city.empty())
            api_url_ = "http://api.openweathermap.org/data/2.5/weather?appid=" + api_key + "&units=metric&q=" + city;
    }
    Measurements get_measurement() override {
        if (api_url_.empty()) return {false, {}};
        return_dict_.clear();
        double temperature, humidity, pressure, wind_speed, wind_deg;
        try {
            const RawMap x = api_->get(api_url_);
            if (x.at("cod") == "404") return {false, {}};
            temperature = std::stod(x.at("temp"));
            humidity = std::stod(x.at("humidity"));
            pressure = std::stod(x.at("pressure"));
            wind_speed = std::stod(x.at("wind_speed"));
            wind_deg = std::stod(x.at("wind_deg"));
        } catch (const std::exception&) {
            return {false, {}};
        }
        value_set(0, temperature);
        value_set(1, humidity);
        value_set(2, pressure);
        if (is_enabled(0) && is_enabled(1) && is_enabled(3)) value_set(3, calculate_dewpoint(temperature, humidity));
        value_set(4, wind_speed);
        value_set(5, wind_deg);
        return {true, return_dict_};
    }

private:
    WeatherApi* api_;
    std::string api_url_;
};

// Client: reads a measurement through the Target interface only.
inline Measurements update_measure(AbstractInput& input_device) { return input_device.get_measurement(); }
