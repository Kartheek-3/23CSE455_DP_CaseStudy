package chain;

import java.util.function.Supplier;

/** Handler: returns a result, either by calling proceed or without it (which ends the chain). */
interface Interceptor {

    String label();

    String intercept(Invocation invocation, Supplier<String> proceed);
}
