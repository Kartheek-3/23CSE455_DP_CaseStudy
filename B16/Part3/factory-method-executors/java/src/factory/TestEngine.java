package factory;

import java.util.ArrayList;
import java.util.List;

/** Creator, modelled on JUnit's HierarchicalTestEngine.createExecutorService (instance B2). */
abstract class TestEngine {

    abstract String name();

    /** The factory method. */
    abstract Executor createExecutor();

    final List<String> execute(List<String[]> tests) {
        Executor executor = createExecutor();
        List<String> lines = new ArrayList<>(List.of("== " + name() + " ==", "executor: " + executor.describe()));
        lines.addAll(executor.run(tests));
        return lines;
    }
}
