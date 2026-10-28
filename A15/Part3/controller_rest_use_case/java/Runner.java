import java.nio.file.*;
import java.util.*;

public class Runner {
    static class Recorder implements BankApi {      // test double standing in for the service layer
        final List<String> log = new ArrayList<>();
        public void create(long u, String k, double b) { log.add(String.format(Locale.ROOT, "create(%d,%s,%.2f)", u, k, b)); }
        public void deposit(long a, double m) { log.add(String.format(Locale.ROOT, "deposit(%d,%.2f)", a, m)); }
        public void withdraw(long a, double m) { log.add(String.format(Locale.ROOT, "withdraw(%d,%.2f)", a, m)); }
        public List<Long> listAll() { log.add("list()"); return List.of(1L, 2L, 3L); }
    }

    static String execute(String script) {
        Recorder rec = new Recorder();
        AccountController ctl = new AccountController(rec);
        String[] t = script.trim().split("\\s+");
        Response r;
        switch (t[0]) {
            case "create" -> r = ctl.create(Long.parseLong(t[1]), t[2], Double.parseDouble(t[3]));
            case "deposit" -> r = ctl.deposit(Long.parseLong(t[1]), Double.parseDouble(t[2]));
            case "withdraw" -> r = ctl.withdraw(Long.parseLong(t[1]), Double.parseDouble(t[2]));
            default -> r = ctl.list();
        }
        return String.join(",", rec.log) + "|" + r.status + " " + r.message;
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
