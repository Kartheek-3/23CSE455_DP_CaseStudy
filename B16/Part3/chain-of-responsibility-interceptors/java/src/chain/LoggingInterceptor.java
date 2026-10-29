package chain;

import java.util.function.Supplier;

final class LoggingInterceptor implements Interceptor {
    public String label() {
        return "logging";
    }

    public String intercept(Invocation invocation, Supplier<String> proceed) {
        return proceed.get();
    }
}
