package decorator;

import java.util.List;

final class LoggingInvocation extends InvocationDecorator {

    private final List<String> log;

    LoggingInvocation(Invocation inner, List<String> log) {
        super(inner);
        this.log = log;
    }

    @Override
    public String proceed() {
        log.add("[log] calling " + name());
        String result = inner.proceed();
        log.add("[log] " + name() + " -> " + result);
        return result;
    }
}
