import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Adapter: sensor driver adaptation. Target = AbstractInput.
 * Derived from mycodo/inputs/base_input.py (AbstractInput.get_measurement / value_set / is_enabled),
 * mycodo/inputs/adafruit_i2c_soil.py and mycodo/inputs/weather_openweathermap_weather.py (InputModule),
 * and mycodo/inputs/sensorutils.py (calculate_dewpoint). The adaptees (adafruit Seesaw I2C driver,
 * OpenWeatherMap HTTP API) are replaced by in-memory stand-ins with the same method names.
 */
public abstract class AbstractInput {
    private final Set<Integer> enabledChannels;
    protected Map<Integer, Double> returnDict = new TreeMap<>();

    protected AbstractInput(Set<Integer> enabledChannels) {
        this.enabledChannels = new HashSet<>(enabledChannels);
    }

    boolean isEnabled(int channel) {
        return enabledChannels.contains(channel);
    }

    void valueSet(int chan, Double value) {
        if (value == null || !isEnabled(chan)) return;
        returnDict.put(chan, value);
    }

    /** Returns {channel: value}, or null when no measurement is possible. */
    public abstract Map<Integer, Double> getMeasurement();
}

/** Adaptee stand-in for adafruit_seesaw.seesaw.Seesaw; a raw value "IOERROR" fails the read. */
class Seesaw {
    private final Map<String, String> raw;

    Seesaw(Map<String, String> raw) {
        this.raw = raw;
    }

    private double read(String key) {
        if (raw.get(key).equals("IOERROR")) throw new UncheckedIOException(new IOException("I2C read of " + key + " failed"));
        return Double.parseDouble(raw.get(key));
    }

    double moistureRead() { return read("moisture"); }

    double getTemp() { return read("temp"); }
}

/** Adaptee stand-in for requests.get(url).json() against the OpenWeatherMap API. */
class WeatherApi {
    private final Map<String, String> response;
    private final boolean networkUp;
    String lastUrl;

    WeatherApi(Map<String, String> response, boolean networkUp) {
        this.response = response;
        this.networkUp = networkUp;
    }

    Map<String, String> get(String url) {
        lastUrl = url;
        if (!networkUp) throw new IllegalStateException("network unreachable");
        return new HashMap<>(response);
    }
}

/** Adapter for the capacitive soil sensor (adafruit_i2c_soil.InputModule). */
class SoilInput extends AbstractInput {
    private final Seesaw sensor;

    SoilInput(Set<Integer> enabledChannels, Seesaw sensor) {
        super(enabledChannels);
        this.sensor = sensor;
    }

    @Override
    public Map<Integer, Double> getMeasurement() {
        if (sensor == null) return null;
        returnDict = new TreeMap<>();
        if (isEnabled(0)) valueSet(0, sensor.moistureRead());
        if (isEnabled(1)) valueSet(1, sensor.getTemp());
        return returnDict;
    }
}

/** Adapter for the city weather API (weather_openweathermap_weather.InputModule). */
class WeatherInput extends AbstractInput {
    private final WeatherApi api;
    private String apiUrl;

    WeatherInput(Set<Integer> enabledChannels, WeatherApi api, String apiKey, String city) {
        super(enabledChannels);
        this.api = api;
        if (!apiKey.isEmpty() && !city.isEmpty())
            apiUrl = "http://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&units=metric&q=" + city;
    }

    static double calculateDewpoint(double tempC, double hum) {
        double tn = tempC >= 0 ? 243.12 : 272.62, m = tempC >= 0 ? 17.62 : 22.46;
        if (hum / 100.0 <= 0) return 0.0;
        double logH = Math.log(hum / 100.0);
        return tn * (logH + (m * tempC) / (tn + tempC)) / (m - logH - m * tempC / (tn + tempC));
    }

    @Override
    public Map<Integer, Double> getMeasurement() {
        if (apiUrl == null) return null;
        returnDict = new TreeMap<>();
        double temperature, humidity, pressure, windSpeed, windDeg;
        try {
            Map<String, String> x = api.get(apiUrl);
            if (x.get("cod").equals("404")) return null;
            temperature = Double.parseDouble(x.get("temp"));
            humidity = Double.parseDouble(x.get("humidity"));
            pressure = Double.parseDouble(x.get("pressure"));
            windSpeed = Double.parseDouble(x.get("wind_speed"));
            windDeg = Double.parseDouble(x.get("wind_deg"));
        } catch (Exception e) {
            return null;
        }
        valueSet(0, temperature);
        valueSet(1, humidity);
        valueSet(2, pressure);
        if (isEnabled(0) && isEnabled(1) && isEnabled(3)) valueSet(3, calculateDewpoint(temperature, humidity));
        valueSet(4, windSpeed);
        valueSet(5, windDeg);
        return returnDict;
    }
}

/** Client: reads a measurement through the Target interface only. */
final class InputController {
    static Map<Integer, Double> updateMeasure(AbstractInput inputDevice) {
        return inputDevice.getMeasurement();
    }
}
