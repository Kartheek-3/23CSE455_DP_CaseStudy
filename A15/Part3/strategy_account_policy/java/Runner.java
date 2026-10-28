import java.nio.file.*;
import java.util.Locale;

public class Runner {
    static String execute(String script) {
        String[] t = script.trim().split("\\s+");
        Account account;
        try { account = new Account(Double.parseDouble(t[2]), new PolicyResolver().forType(t[0])); }
        catch (NoPolicy e) { return "NO_POLICY"; }
        if (t[1].equals("deposit")) {
            account.deposit(Double.parseDouble(t[3]));
            return String.format(Locale.ROOT, "%.2f", account.balance);
        }
        return account.withdraw(Double.parseDouble(t[3])) ? "ALLOWED" : "DENIED";
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
