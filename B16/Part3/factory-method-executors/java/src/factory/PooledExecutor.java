package factory;

import java.util.ArrayList;
import java.util.List;

/** Hands tests to its workers in turn (deterministic, so the output can be compared). */
final class PooledExecutor implements Executor {

    private final int workers;

    PooledExecutor(int workers) {
        this.workers = workers;
    }

    public String describe() {
        return "pool of " + workers + " workers";
    }

    public List<String> run(List<String[]> tests) {
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < tests.size(); i++) {
            lines.add("[worker-" + (i % workers + 1) + "] " + tests.get(i)[0] + " -> " + tests.get(i)[1]);
        }
        return lines;
    }
}
