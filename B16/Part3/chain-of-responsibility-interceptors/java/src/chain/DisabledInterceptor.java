package chain;

import java.util.function.Supplier;

final class DisabledInterceptor implements Interceptor {
    public String label() {
        return "disabled";
    }

    public String intercept(Invocation invocation, Supplier<String> proceed) {
        return invocation.disabled ? "SKIPPED (disabled)" : proceed.get();
    }
}
