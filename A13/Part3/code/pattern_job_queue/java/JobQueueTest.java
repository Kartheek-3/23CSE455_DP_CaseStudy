import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class JobQueueTest {

    static class FakeTransport implements Transport {
        private final Set<String> tried = new HashSet<>();

        public void send(String url, String body) {
            String host = url.split("/")[2];
            if (host.endsWith(".down")) throw new RuntimeException("unreachable");
            if (host.endsWith(".flaky") && tried.add(url)) throw new RuntimeException("timeout");
        }
    }

    static String run(String text) {
        JobQueue queue = new JobQueue(12);
        Set<String> blocked = new HashSet<>();
        DeliverService service = new DeliverService(queue);
        DeliverProcessor processor = new DeliverProcessor(blocked, new FakeTransport());
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 3);
            if (parts[0].equals("add")) {
                service.deliver(parts[1], parts[2]);
            } else if (parts[0].equals("block")) {
                blocked.add(parts[1]);
            } else if (parts[0].equals("run")) {
                for (JobResult r : queue.run(processor::process)) {
                    out.add(r.id() + ":" + r.label() + ":" + r.result() + "@" + r.attempts());
                }
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
