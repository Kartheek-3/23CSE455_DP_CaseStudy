import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Test runner for AbstractMethod.java (reads the shared CSV). */
public class SetpointScheduleTest {
    static final String CSV_PATH = "../../test-cases/setpoint_schedule_cases.csv";
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

    static List<double[]> parseRows(String text, String rowSeparatorRegex) {
        List<double[]> rows = new ArrayList<>();
        for (String row : text.split(rowSeparatorRegex, -1)) {
            String[] numbers = row.split(";", -1);
            double[] values = new double[numbers.length];
            for (int i = 0; i < numbers.length; i++) values[i] = Double.parseDouble(numbers[i]);
            rows.add(values);
        }
        return rows;
    }

    static String runCase(Map<String, String> c) {
        List<AbstractMethod> linked = new ArrayList<>();
        List<double[]> rows = new ArrayList<>();
        if (c.get("method_type").equals("Cascade")) {
            for (String spec : c.get("params").split("\\|", -1)) {
                String[] parts = spec.split(":", 2);
                linked.add(AbstractMethod.createMethodHandler(parts[0], parseRows(parts[1], "/"), null));
            }
        } else {
            rows = parseRows(c.get("params"), "\\|");
        }
        AbstractMethod method = AbstractMethod.createMethodHandler(c.get("method_type"), rows, linked);
        Setpoint result = method.calculateSetpoint(Double.parseDouble(c.get("now")), Double.parseDouble(c.get("start")));
        return (result.value == null ? "None" : result.value.toString()) + "|" + result.ended;
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
        System.out.println("Strategy tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
