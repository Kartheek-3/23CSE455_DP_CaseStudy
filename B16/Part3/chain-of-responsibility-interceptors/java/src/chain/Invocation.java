package chain;

import java.util.ArrayList;
import java.util.List;

/** Modelled on JUnit's InvocationInterceptorChain (instance D9). */
final class Invocation {

    final String name;
    final int durationMs;
    final String outcome;
    final boolean disabled;
    final List<String> trace = new ArrayList<>();

    Invocation(String name, int durationMs, String outcome, boolean disabled) {
        this.name = name;
        this.durationMs = durationMs;
        this.outcome = outcome;
        this.disabled = disabled;
    }
}
