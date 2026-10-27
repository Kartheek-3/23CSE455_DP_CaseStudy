package strategy;

record NameContains(String text) implements TestFilter {
    public boolean includes(TestCase test) {
        return test.name().contains(text);
    }

    public String describe() {
        return "name-contains " + text;
    }
}
