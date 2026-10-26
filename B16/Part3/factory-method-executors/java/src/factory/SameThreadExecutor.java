package factory;

import java.util.List;

final class SameThreadExecutor implements Executor {
    public String describe() {
        return "same thread";
    }

    public List<String> run(List<String[]> tests) {
        return tests.stream().map(t -> "[main] " + t[0] + " -> " + t[1]).toList();
    }
}
