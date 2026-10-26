package decorator;

final class TimeoutInvocation extends InvocationDecorator {

    private final int limitMs;

    TimeoutInvocation(Invocation inner, int limitMs) {
        super(inner);
        this.limitMs = limitMs;
    }

    @Override
    public String proceed() {
        String result = inner.proceed();
        return durationMs() > limitMs ? "TIMEOUT (" + durationMs() + " ms > " + limitMs + " ms limit)" : result;
    }
}
