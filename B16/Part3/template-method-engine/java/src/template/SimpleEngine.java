package template;

final class SimpleEngine extends TestEngine {
    String name() {
        return "simple";
    }

    String runTest(String name, String outcome) {
        return outcome;
    }
}
