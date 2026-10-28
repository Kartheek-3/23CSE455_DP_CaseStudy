import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Test runner for DaemonControl.java (reads the shared CSV). */
public class DaemonRpcTest {
    static final String CSV_PATH = "../../test-cases/daemon_rpc_cases.csv";
    static final String URI = "PYRO:mycodo@localhost:9080";
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

    static Map<String, Daemon> buildNetwork(String spec) {
        Map<String, Daemon> network = new HashMap<>();
        String[] parts = spec.split(":", 2);
        if (parts[0].equals("up")) network.put(URI, new Daemon(0, ""));
        else if (parts[0].equals("slow")) network.put(URI, new Daemon(Double.parseDouble(parts[1]), ""));
        else if (parts[0].equals("unhealthy")) network.put(URI, new Daemon(0, parts[1]));
        return network;
    }

    static String runCase(Map<String, String> c) {
        Double timeout = c.get("timeout").isEmpty() ? null : Double.valueOf(c.get("timeout"));
        DaemonControl control = new DaemonControl(buildNetwork(c.get("daemon")), URI, timeout);
        List<String> results = new ArrayList<>();
        for (String operation : c.get("operations").split("\\|", -1)) {
            String[] p = operation.split(":", -1);
            switch (p[0]) {
                case "check_daemon": results.add(control.checkDaemon()); break;
                case "output_on": results.add(control.outputOn(p[1], Double.parseDouble(p[3]), Integer.parseInt(p[2]))); break;
                case "output_off": results.add(control.outputOff(p[1], Integer.parseInt(p[2]))); break;
                case "output_state": results.add(control.outputState(p[1], Integer.parseInt(p[2]))); break;
                default: results.add(control.outputOnOff(p[1], p[3], Double.parseDouble(p[4]), Integer.parseInt(p[2])));
            }
        }
        return String.join("|", results);
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
        System.out.println("Proxy tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
