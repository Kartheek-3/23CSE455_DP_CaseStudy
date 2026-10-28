import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Test runner for AbstractFunctionAction.java (reads the shared CSV). */
public class AutomationActionsTest {
    static final String CSV_PATH = "../../test-cases/automation_actions_cases.csv";
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

    static Map<String, String> pairs(String text) {
        Map<String, String> out = new HashMap<>();
        for (String item : text.split("\\|", -1)) {
            int eq = item.indexOf('=');
            if (eq >= 0) out.put(item.substring(0, eq), item.substring(eq + 1));
        }
        return out;
    }

    static String[] runCase(Map<String, String> c) {
        Map<String, String> config = pairs(c.get("config"));
        Map<String, String> outputs = new HashMap<>();
        outputs.put("pump1", "Main Pump");
        outputs.put("valve2", "Drip Valve");
        EmailService service = new EmailService(Integer.parseInt(config.getOrDefault("hourly_max", "5")));
        OutputControl control = new OutputControl(outputs);
        ActionInvoker invoker = new ActionInvoker();
        invoker.register("email-1", new EmailAction(config.getOrDefault("email", "grower@farm.org").replace(';', ','), service));
        invoker.register("output-1", new OutputOnOffAction(config.getOrDefault("output_id", "pump1"),
                Integer.parseInt(config.getOrDefault("channel", "0")), config.getOrDefault("state", "on"),
                Double.parseDouble(config.getOrDefault("duration", "0")), control));
        DictVars dictVars = new DictVars(c.get("message").equals("-") ? null : c.get("message"), pairs(c.get("value")));
        DictVars result = invoker.triggerAction(c.get("action_id"), dictVars);
        List<String> log = new ArrayList<>(service.log);
        log.addAll(control.log);
        return new String[] {result.message, log.isEmpty() ? "none" : String.join("|", log)};
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
            String[] expected = {c.get("expected_message"), c.get("expected_log")};
            String[] actual;
            boolean raised = false;
            try {
                actual = runCase(c);
            } catch (Exception e) {
                actual = new String[] {e.getClass().getSimpleName() + ": " + e.getMessage(), ""};
                raised = true;
            }
            boolean ok = expected[0].equals("ERROR") ? raised
                    : (!raised && same(expected[0], actual[0]) && same(expected[1], actual[1]));
            if (ok) {
                passed++;
            } else {
                System.out.println("FAIL " + c.get("case_id") + ": expected " + String.join(" / ", expected) + ", got "
                        + (raised ? "ERROR " : "") + String.join(" / ", actual));
            }
        }
        System.out.println("Command tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
