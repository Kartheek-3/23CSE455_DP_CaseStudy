import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class FederatedInstanceServiceTest {

    static String run(String text) {
        InMemoryInstanceRepository repo = new InMemoryInstanceRepository();
        KeyValueCache cache = new KeyValueCache();
        FederatedInstanceService service = new FederatedInstanceService(repo, cache);
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            if (parts[0].equals("dropcache")) {
                cache.dispose();
                continue;
            }
            int finds = repo.finds, inserts = repo.inserts;
            Instance result = parts[0].equals("fetch") ? service.fetchOrRegister(parts[1]) : service.lookup(parts[1]);
            String source = repo.inserts > inserts ? "insert" : repo.finds > finds ? "db" : "cache";
            out.add((result == null ? "none" : result.host() + "#" + result.id()) + "@" + source);
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
