package chain;

import java.util.List;

final class InterceptorChain {

    private final List<Interceptor> interceptors;

    InterceptorChain(List<Interceptor> interceptors) {
        this.interceptors = interceptors;
    }

    String run(Invocation invocation) {
        return link(0, invocation);
    }

    /** Link i calls interceptor i with a proceed that runs link i + 1; the last link calls the test. */
    private String link(int index, Invocation invocation) {
        if (index == interceptors.size()) {
            invocation.trace.add("invocation");
            return invocation.outcome;
        }
        Interceptor interceptor = interceptors.get(index);
        invocation.trace.add(interceptor.label());
        return interceptor.intercept(invocation, () -> link(index + 1, invocation));
    }
}
