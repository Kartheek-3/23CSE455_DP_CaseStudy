package adapter;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class AdapterTest {

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
            String actual = AdapterDemo.report(DATA.resolve("events.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("the adapter converts engine calls into client calls", () -> {
            List<TestIdentifier> received = new java.util.ArrayList<>();
            TestListener recorder = new TestListener() {
                @Override
                public void testFinished(TestIdentifier identifier, String status) {
                    received.add(identifier);
                }
            };
            new ListenerAdapter(recorder).executionFinished("[engine:e]/[class:CalcTests]/[method:add]", "FAILED");
            return received.equals(List.of(new TestIdentifier("add", true, "CalcTests"))) ? null : "got " + received;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                AdapterDemo.report(DATA.resolve("invalid-events.txt"));
                return "no error was raised";
            }
            catch (AdapterDemo.InputFormatException e) {
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
