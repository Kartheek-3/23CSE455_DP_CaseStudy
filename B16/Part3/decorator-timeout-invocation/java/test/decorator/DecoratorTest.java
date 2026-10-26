package decorator;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class DecoratorTest {

    private static final Path DATA = Path.of("..", "test-data");

    private static int passed;
    private static int failed;

    @FunctionalInterface
    private interface Check {
        /** Returns null when the check passes, otherwise a description of the problem. */
        String run() throws Exception;
    }

    public static void main(String[] args) {
        check("report matches expected-output.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-output.txt"));
            String actual = DecoratorDemo.report(DATA.resolve("invocations.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("decorators stack in any order", () -> {
            List<String> log = new java.util.ArrayList<>();
            // Logging inside the timeout sees the raw outcome; the timeout still decides the final result.
            String result = new TimeoutInvocation(new LoggingInvocation(new TestInvocation("div", 250, "PASS"), log), 100).proceed();
            boolean ok = log.equals(List.of("[log] calling div", "[log] div -> PASS"))
                    && result.equals("TIMEOUT (250 ms > 100 ms limit)");
            return ok ? null : "log=" + log + " result=" + result;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                DecoratorDemo.report(DATA.resolve("invalid-invocations.txt"));
                return "no error was raised";
            }
            catch (DecoratorDemo.InputFormatException e) {
                return expected.equals(e.getMessage()) ? null : "got: " + e.getMessage();
            }
        });

        System.out.println(passed + " passed, " + failed + " failed");
        System.exit(failed == 0 ? 0 : 1);
    }

    private static void check(String name, Check check) {
        String problem;
        try {
            problem = check.run();
        }
        catch (Exception e) {
            problem = "threw " + e;
        }
        if (problem == null) {
            passed++;
            System.out.println("PASS " + name);
        }
        else {
            failed++;
            System.out.println("FAIL " + name + "\n" + problem);
        }
    }
}
