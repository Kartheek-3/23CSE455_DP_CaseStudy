import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Test runner for AbstractInput.java (reads the shared CSV). */
public class SensorDriverTest {
    static final String CSV_PATH = "../../test-cases/sensor_driver_cases.csv";
    static final Pattern NUMBER = Pattern.compile("^[-+]?(\\d+\\.?\\d*|\\.\\d+)([eE][-+]?\\d+)?$");

    static List<String> tokens(String text) {
        List<String> out = new ArrayList<>();
        for (String t : text.split("[\\s|;=,()]+")) {
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }

    static boolean same(String expected, String actual) {
        List<String> a = tokens(expected), b = tokens(actual);
        if (a.size() != b.size()) return false;
        for (int i = 0; i < a.size(); i++) {
            String x = a.get(i), y = b.get(i);
            if (NUMBER.matcher(x).matches() && NUMBER.matcher(y).matches()) {
                if (Math.abs(Double.parseDouble(x) - Double.parseDouble(y)) > 1e-9) return false;
            } else if (!x.equals(y)) {
                return false;
            }
        }
        return true;
    }

    static String runCase(Map<String, String> c) {
        Set<Integer> enabled = new HashSet<>();
        for (String ch : c.get("enabled").split("\\|", -1)) enabled.add(Integer.parseInt(ch));
        Map<String, String> raw = new HashMap<>();
        for (String item : c.get("raw").split("\\|", -1)) {
            int eq = item.indexOf('=');
            if (eq >= 0) raw.put(item.substring(0, eq), item.substring(eq + 1));
        }
        AbstractInput device;
        if (c.get("input").equals("soil")) {
            device = new SoilInput(enabled, c.get("raw").equals("unset") ? null : new Seesaw(raw));
        } else {
            String apiKey = raw.containsKey("api_key") ? raw.remove("api_key") : "";
            String city = raw.containsKey("city") ? raw.remove("city") : "";
            boolean networkUp = !"down".equals(raw.remove("network"));
            device = new WeatherInput(enabled, new WeatherApi(raw, networkUp), apiKey, city);
        }
        Map<Integer, Double> values = InputController.updateMeasure(device);
        if (values == null) return "None";
        List<String> parts = new ArrayList<>();
        for (Map.Entry<Integer, Double> e : values.entrySet()) parts.add(e.getKey() + "=" + e.getValue());
        return String.join("|", parts);
    }

    public static void main(String[] args) throws Exception {
        List<String> lines = new ArrayList<>();
        for (String line : Files.readAllLines(Paths.get(CSV_PATH), StandardCharsets.UTF_8)) {
            line = line.replace("\r", "");
            if (!line.trim().isEmpty()) lines.add(line);
        }
        String[] header = lines.get(0).split(",", -1);
        int passed = 0, total = 0;
        for (String line : lines.subList(1, lines.size())) {
            String[] fields = line.split(",", -1);
            Map<String, String> c = new HashMap<>();
            for (int i = 0; i < header.length; i++) c.put(header[i], fields[i]);
            total++;
            String expected = c.get("expected");
            String actual;
            boolean raised = false;
            try {
                actual = runCase(c);
            } catch (Exception e) {
                actual = e.getClass().getSimpleName() + ": " + e.getMessage();
                raised = true;
            }
            boolean ok = expected.equals("ERROR") ? raised : (!raised && same(expected, actual));
            if (ok) {
                passed++;
            } else {
                System.out.println("FAIL " + c.get("case_id") + ": expected " + expected + ", got "
                        + (raised ? "ERROR " : "") + actual);
            }
        }
        System.out.println("Adapter tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
