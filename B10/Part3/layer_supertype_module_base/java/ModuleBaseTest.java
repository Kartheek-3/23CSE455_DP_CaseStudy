import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

/** Test runner for AbstractBaseController.java (reads the shared CSV). */
public class ModuleBaseTest {
    static final String CSV_PATH = "../../test-cases/module_base_cases.csv";
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

    static String fmt(Object value) {
        return value == null ? "None" : value.toString();
    }

    static List<Map<String, String>> optionDefs(String text) {
        String[] keys = {"id", "type", "default_value", "required"};
        List<Map<String, String>> defs = new ArrayList<>();
        for (String item : text.split("\\|", -1)) {
            String[] fields = item.split(":", -1);
            Map<String, String> def = new HashMap<>();
            for (int i = 0; i < keys.length; i++) if (!fields[i].equals("!")) def.put(keys[i], fields[i]);
            defs.add(def);
        }
        return defs;
    }

    static Map<String, String> pairs(String text) {
        Map<String, String> out = new HashMap<>();
        for (String item : text.split("\\|", -1)) {
            int eq = item.indexOf('=');
            if (eq >= 0) out.put(item.substring(0, eq), item.substring(eq + 1).replace(';', ','));
        }
        return out;
    }

    static String runCase(Map<String, String> c) {
        OptionStore store = new OptionStore();
        boolean isInput = c.get("member").equals("input");
        AbstractBaseController member = isInput ? new AbstractInput("u1", store) : new AbstractFunction("u1", store);
        member.setupCustomOptions(optionDefs(c.get("option_defs")), pairs(c.get("stored")));
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, Object> e : new TreeMap<>(member.options).entrySet()) parts.add(e.getKey() + "=" + fmt(e.getValue()));
        if (!member.errors.isEmpty()) parts.add("errors=" + member.errors.size());
        if (!c.get("persist").equals("-")) {
            String[] kv = c.get("persist").split("=", 2);
            if (isInput) {
                ((AbstractInput) member).setCustomOption(kv[0], kv[1]);
                parts.add("stored=" + fmt(((AbstractInput) member).getCustomOption(kv[0])));
                parts.add("other_table=" + fmt(new AbstractFunction("u1", store).getCustomOption(kv[0])));
            } else {
                ((AbstractFunction) member).setCustomOption(kv[0], kv[1]);
                parts.add("stored=" + fmt(((AbstractFunction) member).getCustomOption(kv[0])));
                parts.add("other_table=" + fmt(new AbstractInput("u1", store).getCustomOption(kv[0])));
            }
        }
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
        System.out.println("Layer Supertype tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
