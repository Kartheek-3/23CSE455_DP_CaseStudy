import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;

public class PluginHostTest {

    static Consumer<HandlerRegistrar> pluginSetup(String name) {
        return registrar -> {
            if (name.equals("upper")) registrar.addHandler("note_view_interruptor", t -> t.toUpperCase());
            else if (name.equals("exclaim")) registrar.addHandler("note_view_interruptor", t -> t + "!");
            else if (name.equals("share")) registrar.addHandler("note_action", t -> "Share");
            else if (name.equals("bad")) {
                registrar.addHandler("note_view_interruptor", t -> t + "?");
                throw new IllegalStateException("boom");
            }
        };
    }

    static String run(String text) {
        PluginHost host = new PluginHost();
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("install")) {
                    host.install(parts[1], pluginSetup(parts[1]));
                } else if (parts[0].equals("abort")) {
                    host.abort(parts[1]);
                } else if (parts[0].equals("view")) {
                    String value = parts[1];
                    for (Function<String, String> fn : host.getHandlers("note_view_interruptor")) value = fn.apply(value);
                    out.add(value);
                } else if (parts[0].equals("actions")) {
                    List<String> labels = new ArrayList<>();
                    for (Function<String, String> fn : host.getHandlers("note_action")) labels.add(fn.apply(""));
                    out.add(String.join(",", labels));
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
