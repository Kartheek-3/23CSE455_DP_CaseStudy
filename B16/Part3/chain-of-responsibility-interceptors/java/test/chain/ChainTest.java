package chain;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class ChainTest {

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
            String actual = ChainDemo.report(DATA.resolve("invocations.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("a handler can stop the chain before later links", () -> {
            Invocation invocation = new Invocation("div", 10, "PASS", true);
            String result = new InterceptorChain(List.of(new DisabledInterceptor(), new LoggingInterceptor())).run(invocation);
            return result.equals("SKIPPED (disabled)") && invocation.trace.equals(List.of("disabled")) ? null
                    : "result=" + result + " trace=" + invocation.trace;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                ChainDemo.report(DATA.resolve("invalid-invocations.txt"));
                return "no error was raised";
            }
            catch (ChainDemo.InputFormatException e) {
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
