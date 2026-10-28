package template;

import java.util.List;

final class LifecycleEngine extends TestEngine {
    String name() {
        return "lifecycle";
    }

    String runTest(String name, String outcome) {
        return outcome;
    }

    @Override
    void beforeEach(String name, List<String> lines) {
        lines.add("  beforeEach " + name);
    }

    @Override
    void afterEach(String name, List<String> lines) {
        lines.add("  afterEach " + name);
    }
}
