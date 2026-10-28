import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class RouterTest {

    static String describe(Resolved res) {
        StringBuilder text = new StringBuilder(res.component());
        for (String key : new TreeSet<>(res.params().keySet())) text.append(" ").append(key).append("=").append(res.params().get(key));
        if (!res.query().isEmpty()) text.append(" query=").append(res.query());
        if (!res.hash().isEmpty()) text.append(" hash=").append(res.hash());
        return text + (res.popup() ? " popup" : "");
    }

    static String run(String text) {
        List<Route> routes = List.of(new Route("/", "home", false), new Route("/notes/:id", "note-detail", false),
                new Route("/settings", "settings", true), new Route("/search", "search", false));
        boolean loggedIn = false;
        Router router = null;
        int[] changes = {0};
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            if (parts[0].equals("login")) {
                loggedIn = parts[1].equals("on");
            } else if (parts[0].equals("nav")) {
                if (router == null) {
                    router = new Router(routes, loggedIn, "notfound");
                    router.onChange(res -> changes[0]++);
                }
                out.add(describe(router.navigate(parts[1])));
            }
        }
        out.add("changes=" + changes[0]);
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
