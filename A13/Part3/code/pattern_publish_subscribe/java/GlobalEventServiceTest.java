import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.BiConsumer;

public class GlobalEventServiceTest {

    static String run(String text) {
        Broker broker = new Broker();
        GlobalEventService events = new GlobalEventService(broker);
        List<String> out = new ArrayList<>();
        Map<String, BiConsumer<String, String>> handlers = new HashMap<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 4);
            if (parts[0].equals("sub")) {
                String name = parts[1];
                BiConsumer<String, String> handler = handlers.computeIfAbsent(name + " " + parts[2],
                        k -> (channel, message) -> out.add(name + "<-" + channel + ":" + message));
                broker.subscribe(parts[2], handler);
            } else if (parts[0].equals("unsub")) {
                broker.unsubscribe(parts[2], handlers.get(parts[1] + " " + parts[2]));
            } else if (parts[0].equals("main")) {
                if (events.publishMainStream(parts[1], parts[2], parts[3]) == 0) out.add("dropped:mainStream:" + parts[1]);
            } else if (parts[0].equals("broadcast")) {
                String body = command.split(" ", 3)[2];
                if (events.publishBroadcastStream(parts[1], body) == 0) out.add("dropped:broadcast");
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
