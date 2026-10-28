import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Supplier;

public class TelemetryRegistryTest {

    static class FakeSentry implements SentryClient {
        private final List<String> log;

        FakeSentry(List<String> log) { this.log = log; }

        public void captureMessage(String message, Map<String, String> options) {
            String user = options.containsKey("user.id") ? ",user.id=" + options.get("user.id") : "";
            log.add("sentry.captureMessage(" + message + ",level=" + options.get("level") + user + ")");
        }

        public <T> T startSpan(String name, Supplier<T> fn) {
            log.add("sentry.startSpan(" + name + ")");
            return fn.get();
        }

        public void close(int timeoutMs) { log.add("sentry.close(" + timeoutMs + ")"); }
    }

    static String run(String text) {
        List<String> log = new ArrayList<>();
        TelemetryRegistry registry = null;
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 3);
            if (parts[0].equals("adapters")) {
                List<TelemetryAdapter> adapters = new ArrayList<>();
                for (int i = 0; i < Integer.parseInt(parts[1]); i++) adapters.add(new SentryTelemetryAdapter(new FakeSentry(log)));
                registry = new TelemetryRegistry(adapters);
            } else if (parts[0].equals("msg")) {
                registry.captureMessage(parts[2], parts[1].equals("-") ? null : parts[1]);
            } else if (parts[0].equals("span")) {
                String value = parts[2];
                try {
                    log.add("result=" + registry.startSpan(parts[1], () -> {
                        if (value.startsWith("!")) throw new RuntimeException(value.substring(1));
                        return value;
                    }));
                } catch (RuntimeException e) {
                    log.add("ERR:" + e.getMessage());
                }
            } else if (parts[0].equals("shutdown")) {
                registry.shutdown();
            }
        }
        return String.join("~", log);
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
