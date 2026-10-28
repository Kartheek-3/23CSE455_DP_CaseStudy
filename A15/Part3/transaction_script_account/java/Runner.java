import java.nio.file.*;
import java.util.Locale;

public class Runner {
    static String execute(String script) {
        AccountScripts scripts = new AccountScripts();
        String out = "";
        for (String cmd : script.split(";")) {
            String[] t = cmd.trim().split("\\s+");
            try {
                switch (t[0]) {
                    case "open" -> out = String.valueOf(scripts.open(t[1], Double.parseDouble(t[2])));
                    case "deposit" -> out = String.format(Locale.ROOT, "%.2f", scripts.deposit(Long.parseLong(t[1]), Double.parseDouble(t[2])));
                    default -> out = String.format(Locale.ROOT, "%.2f", scripts.withdraw(Long.parseLong(t[1]), Double.parseDouble(t[2])));
                }
            } catch (BadRequest e) { out = "BAD_REQUEST"; }
            catch (NotFound e) { out = "NOT_FOUND"; }
        }
        return out;
    }

    public static void main(String[] args) throws Exception {
        int passed = 0, total = 0;
        for (String line : Files.readAllLines(Path.of(args[0]))) {
            if (line.isBlank() || line.startsWith("#")) continue;
            String[] p = line.split(" => ", 2);
            total++;
            String got = execute(p[0]);
            if (got.equals(p[1])) { passed++; System.out.println("PASS case" + total); }
            else System.out.println("FAIL case" + total + " expected=" + p[1] + " got=" + got);
        }
        System.out.println("RESULT passed=" + passed + " total=" + total);
        System.exit(passed == total ? 0 : 1);
    }
}
