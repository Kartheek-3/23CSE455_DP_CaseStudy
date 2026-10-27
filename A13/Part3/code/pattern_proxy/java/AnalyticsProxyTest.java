import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class AnalyticsProxyTest {

    static String run(String text) {
        AnalyticsProxy proxy = new AnalyticsProxy();
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 2);
            try {
                switch (parts[0]) {
                    case "set" -> proxy.setAnalytics(new RealAnalytics());
                    case "track" -> out.add(proxy.track(parts[1]));
                    case "page" -> out.add(proxy.page(parts[1]));
                    default -> out.add(proxy.identify(parts[1]));
                }
            } catch (IllegalStateException e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
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
