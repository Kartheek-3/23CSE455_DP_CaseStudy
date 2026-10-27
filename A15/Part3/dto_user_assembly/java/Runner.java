import java.nio.file.*;

public class Runner {
    static String execute(String script) {
        String[] t = script.trim().split("\\s+");
        UserAssembler asm = new UserAssembler();
        int age = Integer.parseInt(t[2]);
        if (t[0].equals("toDto")) return asm.toDto(new User(7, t[1], age, t[3], t[4])).text();
        UserDto dto = new UserDto(t[1], age, t[3], t[4]);
        if (t[0].equals("toEntity")) return asm.toEntity(dto).text();
        return asm.toDto(asm.toEntity(dto)).text();
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
