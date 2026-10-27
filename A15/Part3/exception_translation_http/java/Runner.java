import java.nio.file.*;

public class Runner {
    static String execute(String script) {
        AccountService svc = new AccountService();
        String[] t = script.trim().split("\\s+");
        return switch (t[0]) {
            case "deposit" -> Translator.translate(() -> svc.deposit(Double.parseDouble(t[1])));
            case "find" -> Translator.translate(() -> svc.find(Long.parseLong(t[1])));
            default -> Translator.translate(svc::boom);
        };
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
