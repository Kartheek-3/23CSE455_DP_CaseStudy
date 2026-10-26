package strategy;

record ExcludeTag(String tag) implements TestFilter {
    public boolean includes(TestCase test) {
        return !test.tags().contains(tag);
    }

    public String describe() {
        return "exclude-tag " + tag;
    }
}
