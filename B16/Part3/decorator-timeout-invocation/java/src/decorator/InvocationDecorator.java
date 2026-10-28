package decorator;

/** Base decorator: same interface, forwards everything to the wrapped invocation. */
abstract class InvocationDecorator implements Invocation {

    protected final Invocation inner;

    InvocationDecorator(Invocation inner) {
        this.inner = inner;
    }

    public String name() {
        return inner.name();
    }

    public int durationMs() {
        return inner.durationMs();
    }

    public String proceed() {
        return inner.proceed();
    }
}
