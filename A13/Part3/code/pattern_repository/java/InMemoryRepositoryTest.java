import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class InMemoryRepositoryTest {

    static String show(Map<String, String> entity) {
        List<String> fields = new ArrayList<>();
        for (String key : new TreeSet<>(entity.keySet())) fields.add(key + "=" + entity.get(key));
        return "{" + String.join(",", fields) + "}";
    }

    static String run(String text) {
        UserService service = new UserService(new UsersRepository());
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("insert")) {
                    out.add(show(service.register(parts[1])));
                } else if (parts[0].equals("find")) {
                    Map<String, String> found = service.findByName(parts[1]);
                    out.add(found == null ? "none" : show(found));
                } else if (parts[0].equals("findorfail")) {
                    out.add(show(service.getByName(parts[1])));
                } else if (parts[0].equals("count")) {
                    out.add(String.valueOf(service.count()));
                }
            } catch (EntityNotFound e) {
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
