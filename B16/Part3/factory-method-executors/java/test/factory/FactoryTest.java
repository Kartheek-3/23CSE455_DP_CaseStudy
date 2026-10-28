package factory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class FactoryTest {

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
            String actual = FactoryDemo.report(DATA.resolve("tests.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("a subclass changes only the created product", () -> {
            TestEngine three = new TestEngine() {
                String name() {
                    return "three";
                }

                Executor createExecutor() {
                    return new PooledExecutor(3);
                }
            };
            List<String> lines = three.execute(List.of(new String[] { "a", "PASS" }, new String[] { "b", "PASS" },
                    new String[] { "c", "PASS" }, new String[] { "d", "FAIL" }));
            List<String> expected = List.of("== three ==", "executor: pool of 3 workers", "[worker-1] a -> PASS",
                    "[worker-2] b -> PASS", "[worker-3] c -> PASS", "[worker-1] d -> FAIL");
            return lines.equals(expected) ? null : "got " + lines;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                FactoryDemo.report(DATA.resolve("invalid-tests.txt"));
                return "no error was raised";
            }
            catch (FactoryDemo.InputFormatException e) {
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
