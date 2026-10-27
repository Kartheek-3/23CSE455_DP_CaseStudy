import java.nio.file.*;
import java.util.*;

public class Runner {
    static String execute(String script) {
        AccountService svc = new AccountService(new InMemoryAccountDao());
        String out = "";
        for (String cmd : script.split(";")) {
            String[] t = cmd.trim().split("\\s+");
            try {
                switch (t[0]) {
                    case "save" -> out = String.valueOf(svc.open(Double.parseDouble(t[1])));
                    case "find" -> out = String.format(Locale.ROOT, "%.2f", svc.balanceOf(Long.parseLong(t[1])));
                    default -> {
                        StringJoiner j = new StringJoiner(",");
                        for (double b : svc.balances()) j.add(String.format(Locale.ROOT, "%.2f", b));
                        out = j.length() == 0 ? "-" : j.toString();
                    }
                }
            } catch (NotFound e) {
                out = "NOT_FOUND";
            }
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
