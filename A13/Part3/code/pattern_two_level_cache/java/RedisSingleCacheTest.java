import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Supplier;

public class RedisSingleCacheTest {

    static class FakeRedis implements RemoteStore {
        final Map<String, String> data = new HashMap<>();
        int reads = 0;

        public String get(String key) { reads++; return data.get(key); }

        public void set(String key, String value) { data.put(key, value); }

        public void delete(String key) { data.remove(key); }
    }

    static String run(String text) {
        FakeRedis redis = new FakeRedis();
        long[] now = {0};
        int[] calls = {0};
        Supplier<String> fetcher = () -> "v" + (++calls[0]);
        RedisSingleCache[] cache = {new RedisSingleCache(redis, "demo", 100, fetcher, () -> now[0])};
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            if (parts[0].equals("fetch") || parts[0].equals("get")) {
                int reads = redis.reads, fetched = calls[0];
                String value = parts[0].equals("fetch") ? cache[0].fetch() : cache[0].get();
                if (value == null) {
                    out.add("none");
                } else {
                    String level = calls[0] > fetched ? "fetcher" : redis.reads > reads ? "L2" : "L1";
                    out.add(value + "@" + level);
                }
            } else if (parts[0].equals("delete")) {
                cache[0].delete();
            } else if (parts[0].equals("tick")) {
                now[0] += Long.parseLong(parts[1]);
            } else if (parts[0].equals("newproc")) {
                cache[0] = new RedisSingleCache(redis, "demo", 100, fetcher, () -> now[0]);
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
