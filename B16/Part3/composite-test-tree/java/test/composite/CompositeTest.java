package composite;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Plain test runner: prints PASS/FAIL per check and exits with 0 only if every check passed. */
public final class CompositeTest {

    private static final Path DATA = Path.of("..", "test-data");

    private static int passed;
    private static int failed;

    @FunctionalInterface
    private interface Check {
        /** Returns null when the check passes, otherwise a description of the problem. */
        String run() throws Exception;
    }

    public static void main(String[] args) {
        check("report for tag 'slow' matches expected-output.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-output.txt"));
            String actual = CompositeDemo.report(DATA.resolve("tree.txt"), "slow");
            return expected.equals(actual) ? null : "got:\n" + actual;
        });
        check("a leaf and a container answer countTests the same way", () -> {
            TestContainer engine = new TestContainer("engine", "e");
            TestContainer cls = new TestContainer("class", "C");
            cls.addChild(new TestCase("a", List.of()));
            cls.addChild(new TestCase("b", List.of("x")));
            engine.addChild(cls);
            List<TestNode> nodes = List.of(new TestCase("t", List.of()), cls, engine);
            List<Integer> counts = nodes.stream().map(TestNode::countTests).toList();
            return counts.equals(List.of(1, 2, 2)) ? null : "counts were " + counts;
        });
        check("invalid input is rejected with expected-error.txt", () -> {
            String expected = Files.readString(DATA.resolve("expected-error.txt")).strip();
            try {
                CompositeDemo.report(DATA.resolve("invalid-tree.txt"), "slow");
                return "no error was raised";
            }
            catch (TreeFormatException e) {
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
