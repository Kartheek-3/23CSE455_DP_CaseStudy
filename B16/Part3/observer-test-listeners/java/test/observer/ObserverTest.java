package observer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class ObserverTest {

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
            String actual = ObserverDemo.report(DATA.resolve("events.txt"));
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("a throwing listener does not stop the next one", () -> {
            List<String> seen = new ArrayList<>();
            CompositeTestExecutionListener listeners = new CompositeTestExecutionListener();
            listeners.register(new BrokenListener());
            listeners.register(new TestExecutionListener() {
                @Override
                public void executionStarted(String testId) {
                    seen.add(testId);
                }
            });
            listeners.executionStarted("T#a");
            boolean ok = seen.equals(List.of("T#a")) && listeners.failures().size() == 1;
            return ok ? null : "seen=" + seen + " failures=" + listeners.failures();
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                ObserverDemo.report(DATA.resolve("invalid-events.txt"));
                return "no error was raised";
            }
            catch (EventFormatException e) {
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
