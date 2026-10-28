import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Consumer;

public class PreferencesManagerTest {

    static String run(String text) {
        PreferencesManager manager = new PreferencesManager();
        List<String> out = new ArrayList<>();
        Map<String, Consumer<CommitEvent>> listeners = new HashMap<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("on")) {
                    String name = parts[1];
                    listeners.put(name, event -> {
                        if (name.equals("boom")) throw new IllegalStateException("listener failed");
                        out.add(name + ":" + event.key() + "=" + event.value() + "(oldValue=" + event.oldValue() + ")");
                    });
                    manager.on(listeners.get(name));
                } else if (parts[0].equals("off")) {
                    manager.off(listeners.get(parts[1]));
                } else if (parts[0].equals("commit")) {
                    manager.commit(parts[1], parts[2]);
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
