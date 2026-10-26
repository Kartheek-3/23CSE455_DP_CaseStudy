import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;


public class LoggingFactoryTest {

    static String run(String text) {
        String format = text.equals("-") ? null : text.equals("<empty>") ? "" : text;
        try {
            LogBackend backend = LoggingFactory.createLoggingBackend(format);
            return backend.name() + ":" + backend.write("info", "hi");
        } catch (IllegalArgumentException e) {
            return "ERR:" + e.getMessage();
        }
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
