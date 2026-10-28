package template;

import java.util.ArrayList;
import java.util.List;

/** Template Method, modelled on JUnit's HierarchicalTestEngine.execute (instance B1). */
abstract class TestEngine {

    /** The template method: final, so subclasses cannot change the order of the steps. */
    final List<String> execute(List<String[]> tests) {
        List<String> lines = new ArrayList<>();
        lines.add(name() + ": start (" + tests.size() + " tests)");
        int passed = 0;
        for (String[] test : tests) {
            beforeEach(test[0], lines);
            String result = runTest(test[0], test[1]);
            lines.add("  run " + test[0] + " -> " + result);
            afterEach(test[0], lines);
            if (result.equals("PASS")) {
                passed++;
            }
        }
        lines.add(name() + ": done " + passed + " passed, " + (tests.size() - passed) + " failed");
        return lines;
    }

    abstract String name();

    /** Primitive operation. */
    abstract String runTest(String name, String outcome);

    /** Hook: does nothing unless overridden. */
    void beforeEach(String name, List<String> lines) {
    }

    /** Hook: does nothing unless overridden. */
    void afterEach(String name, List<String> lines) {
    }
}
