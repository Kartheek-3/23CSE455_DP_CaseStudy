import java.nio.file.*;

public class Runner {
    static String execute(String script) {
        EventPublisher publisher = new EventPublisher();
        AuditLog audit = new AuditLog();
        HighValueAlert alert = new HighValueAlert();
        publisher.subscribe(audit);
        publisher.subscribe(alert);
        AccountService svc = new AccountService(publisher);
        String out = "";
        for (String cmd : script.split(";")) {
            String[] t = cmd.trim().split("\\s+");
            try {
                switch (t[0]) {
                    case "deposit" -> { svc.deposit(Long.parseLong(t[1]), Double.parseDouble(t[2])); out = "ok"; }
                    case "withdraw" -> { svc.withdraw(Long.parseLong(t[1]), Double.parseDouble(t[2])); out = "ok"; }
                    case "audit" -> out = audit.text(Long.parseLong(t[1]));
                    default -> out = alert.text();
                }
            } catch (BadRequest e) { out = "BAD_REQUEST"; }
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
