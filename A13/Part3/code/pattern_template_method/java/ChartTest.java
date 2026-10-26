import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class ChartTest {

    static class FaultyChart extends Chart {
        protected Map<String, Integer> tickMajor(String group) {
            throw new IllegalStateException("source unavailable");
        }

        protected Map<String, Integer> tickMinor(String group) {
            return Map.of();
        }
    }

    static String run(String text) {
        String[] parts = text.split(" ");
        Chart chart = switch (parts[0]) {
            case "users" -> new UsersChart();
            case "notes" -> new NotesChart();
            default -> new FaultyChart();
        };
        try {
            Map<String, Integer> columns = chart.tick(parts[1].equals("major"), null);
            List<String> out = new ArrayList<>();
            for (Map.Entry<String, Integer> e : columns.entrySet()) out.add(e.getKey() + "=" + e.getValue());
            return out.isEmpty() ? "none" : String.join(",", out);
        } catch (IllegalStateException e) {
            return "ERR:" + e.getMessage();
        }
    }

    public static void main(String[] args) throws Exception {
        int passed = 0, total = 0;
        for (String line : Files.readAllLines(Path.of(args[0]))) {
            if (line.isBlank() || line.startsWith("#")) continue;
            String[] f = line.split("\\|", 3);
            total++;
            String got = run(f[1]);
            boolean ok = got.equals(f[2]);
            if (ok) passed++;
            System.out.println((ok ? "PASS " : "FAIL ") + f[0] + (ok ? "" : ": expected [" + f[2] + "] got [" + got + "]"));
        }
        System.out.println("passed " + passed + "/" + total);
        System.exit(passed == total ? 0 : 1);
    }
}
