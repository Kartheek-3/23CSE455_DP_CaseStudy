package chain;

import java.util.function.Supplier;

final class TimeoutInterceptor implements Interceptor {

    static final int LIMIT_MS = 100;

    public String label() {
        return "timeout";
    }

    public String intercept(Invocation invocation, Supplier<String> proceed) {
        String result = proceed.get();
        return invocation.durationMs > LIMIT_MS ? "TIMEOUT (" + invocation.durationMs + " ms > " + LIMIT_MS + " ms limit)" : result;
    }
}
