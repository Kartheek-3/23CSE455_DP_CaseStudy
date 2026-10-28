import java.nio.file.*;

public class Runner {
    static String execute(String script) {
        Container c = new Container();
        c.register("Service", new Service());
        String out = "";
        for (String cmd : script.split(";")) {
            String[] t = cmd.trim().split("\\s+");
            try {
                switch (t[0]) {
                    case "register" -> { c.register("Dao", t[1].equals("real") ? new RealDao() : new FakeDao()); out = "registered"; }
                    case "wire" -> { c.wire(); out = "wired"; }
                    default -> out = ((Service) c.get("Service")).describe();
                }
            } catch (MissingDependency e) { out = "MISSING:" + e.getMessage(); }
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
