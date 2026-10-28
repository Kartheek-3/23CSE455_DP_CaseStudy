package strategy;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class StrategyTest {

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
            String actual = StrategyDemo.report(DATA.resolve("tests.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("a new strategy plugs in without changing the selector", () -> {
            TestFilter singleTag = new TestFilter() { // a strategy the selector has never seen
                public boolean includes(TestCase test) {
                    return test.tags().size() == 1;
                }

                public String describe() {
                    return "single-tag";
                }
            };
            List<TestCase> tests = StrategyDemo.parse(Files.readAllLines(DATA.resolve("tests.txt")));
            List<String> names = new TestSelector(singleTag).select(tests).stream().map(TestCase::name).toList();
            List<String> expected = List.of("CalcTests#add", "CalcTests#sub", "StringTests#concat", "StringTests#upper", "SlowTests#bigSum");
            return names.equals(expected) ? null : "got " + names;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                StrategyDemo.report(DATA.resolve("invalid-tests.txt"));
                return "no error was raised";
            }
            catch (StrategyDemo.InputFormatException e) {
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
