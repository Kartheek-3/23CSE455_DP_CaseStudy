package strategy;

/** Context: holds one strategy and applies it to every test, without knowing which strategy it is. */
final class TestSelector {

    private final TestFilter filter;

    TestSelector(TestFilter filter) {
        this.filter = filter;
    }

    java.util.List<TestCase> select(java.util.List<TestCase> tests) {
        return tests.stream().filter(filter::includes).toList();
    }
}
