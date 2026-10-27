import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class ApiControllerTest {

    static ApiController build() {
        Map<String, String> tokens = Map.of("t-alice", "alice", "t-bob", "bob");
        ApiController controller = new ApiController(tokens::get, 2);
        controller.register(new Endpoint("ping", false, (body, user) -> "pong"));
        controller.register(new Endpoint("notes/create", true, (body, user) -> "created " + body + " by " + user));
        controller.register(new Endpoint("i", true, (body, user) -> user));
        return controller;
    }

    static String run(String text) {
        ApiController controller = build();
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 4);
            Response response = controller.handle(parts[1], parts[2], parts.length > 3 ? parts[3] : "");
            out.add(response.status() + " " + response.text());
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
