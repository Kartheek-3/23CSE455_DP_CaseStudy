package strategy;

record IncludeTag(String tag) implements TestFilter {
    public boolean includes(TestCase test) {
        return test.tags().contains(tag);
    }

    public String describe() {
        return "include-tag " + tag;
    }
}
