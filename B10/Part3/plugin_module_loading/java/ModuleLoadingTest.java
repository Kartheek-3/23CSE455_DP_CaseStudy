import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

/** Test runner for InputController.java (reads the shared CSV). */
public class ModuleLoadingTest {
    static final String CSV_PATH = "../../test-cases/module_loading_cases.csv";
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

    static boolean check(String expected, String actual, boolean raised) {
        return expected.equals("ERROR") ? raised : (!raised && same(expected, actual));
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
            List<String> files = new ArrayList<>();
            for (String f : c.get("files").split("\\|", -1)) if (!f.isEmpty()) files.add(f);
            List<String> errors = new ArrayList<>();
            String registry, device = null;
            boolean raised = false, deviceRaised = false;
            Map<String, Map<String, String>> dictInputs = null;
            try {
                dictInputs = InputController.parseInputInformation(files, errors);
                List<String> entries = new ArrayList<>();
                for (Map.Entry<String, Map<String, String>> e : new TreeMap<>(dictInputs).entrySet())
                    entries.add(e.getKey() + "=" + e.getValue().get("file_path"));
                if (!errors.isEmpty()) entries.add("duplicates=" + errors.size());
                registry = entries.isEmpty() ? "none" : String.join("|", entries);
            } catch (Exception e) {
                registry = e.getClass().getSimpleName() + ": " + e.getMessage();
                raised = true;
            }
            boolean ok = check(c.get("expected_registry"), registry, raised);
            if (ok && !raised) {
                try {
                    device = new InputController(dictInputs).initialize(c.get("device"), null).describe();
                } catch (Exception e) {
                    device = e.getClass().getSimpleName() + ": " + e.getMessage();
                    deviceRaised = true;
                }
                ok = check(c.get("expected_device"), device, deviceRaised);
            }
            if (ok) {
                passed++;
            } else {
                System.out.println("FAIL " + c.get("case_id") + ": expected " + c.get("expected_registry") + " / "
                        + c.get("expected_device") + ", got " + (raised ? "ERROR " : "") + registry + " / "
                        + (deviceRaised ? "ERROR " : "") + device);
            }
        }
        System.out.println("Plugin tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
