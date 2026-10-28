import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Test runner for CRUDMixin.java (reads the shared CSV). */
public class UserRoleTest {
    static final String CSV_PATH = "../../test-cases/user_role_cases.csv";
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
        Session session = new Session();
        Map<String, User> users = new HashMap<>();
        List<String> results = new ArrayList<>();
        for (String operation : c.get("operations").split("\\|", -1)) {
            String[] p = operation.split(":", -1);
            switch (p[0]) {
                case "user": {
                    User user = new User(session, p[1], p[2]);
                    users.put(p[1], user);
                    user.setPassword(p[3]);
                    results.add(user.save() != null ? "saved" : "None");
                    break;
                }
                case "role":
                    results.add(new Role(session, p[1].equals("!") ? null : p[1]).save() != null ? "saved" : "None");
                    break;
                case "delete_user":
                case "delete_new": {
                    User user = p[0].equals("delete_user") ? users.get(p[1]) : new User(session, p[1], p[1] + "@new");
                    int logSize = session.log.size();
                    user.delete();
                    results.add(session.log.size() > logSize ? "error_logged" : "deleted");
                    break;
                }
                case "check": {
                    User user = users.get(p[1]);
                    results.add(User.checkPassword(p[2], user.passwordHash).equals(user.passwordHash) ? "match" : "no_match");
                    break;
                }
                case "check_hash":
                    results.add(User.checkPassword(p[1], p[2]));
                    break;
                case "count_users":
                    results.add(String.valueOf(session.count(User.class)));
                    break;
                default:
                    results.add(String.valueOf(session.count(Role.class)));
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
        System.out.println("Active Record tests: " + passed + "/" + total + " passed");
        System.exit(passed == total ? 0 : 1);
    }
}
