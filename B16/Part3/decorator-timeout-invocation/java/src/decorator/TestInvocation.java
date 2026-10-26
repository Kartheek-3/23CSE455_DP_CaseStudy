package decorator;

/** Concrete component: the test method itself (its duration is given, not measured). */
record TestInvocation(String name, int durationMs, String outcome) implements Invocation {
    public String proceed() {
        return outcome;
    }
}
