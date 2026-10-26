package template;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class TemplateTest {

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
            String actual = TemplateDemo.report(DATA.resolve("tests.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("a new engine gets the whole skeleton from one primitive", () -> {
            TestEngine alwaysPass = new TestEngine() {
                String name() {
                    return "always-pass";
                }

                String runTest(String name, String outcome) {
                    return "PASS";
                }
            };
            List<String> lines = alwaysPass.execute(List.<String[]>of(new String[] { "a", "FAIL" }));
            List<String> expected = List.of("always-pass: start (1 tests)", "  run a -> PASS", "always-pass: done 1 passed, 0 failed");
            return lines.equals(expected) ? null : "got " + lines;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                TemplateDemo.report(DATA.resolve("invalid-tests.txt"));
                return "no error was raised";
            }
            catch (TemplateDemo.InputFormatException e) {
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
