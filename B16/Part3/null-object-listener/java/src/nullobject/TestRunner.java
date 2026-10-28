package nullobject;

import java.util.List;

final class TestRunner {

    final TestListener listener;

    TestRunner() {
        this(TestListener.NOOP);
    }

    TestRunner(TestListener listener) {
        this.listener = listener;
    }

    String run(List<String[]> tests) {
        int passed = 0;
        for (String[] test : tests) {
            listener.testFinished(test[0], test[1]); // no null check anywhere
            if (test[1].equals("PASS")) {
                passed++;
            }
        }
        return "result: " + passed + " passed, " + (tests.size() - passed) + " failed";
    }
}
