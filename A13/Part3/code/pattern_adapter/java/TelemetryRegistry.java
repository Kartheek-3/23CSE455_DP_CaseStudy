import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/** What the application needs from a telemetry backend (the Target). */
interface TelemetryAdapter {
    void captureMessage(String message, String userId);
    <T> T startSpan(String name, Supplier<T> fn);
    void shutdown();
}

/** The part of the Sentry SDK the adapter uses (the Adaptee). */
interface SentryClient {
    void captureMessage(String message, Map<String, String> options);
    <T> T startSpan(String name, Supplier<T> fn);
    void close(int timeoutMs);
}

class SentryTelemetryAdapter implements TelemetryAdapter {
    private static final int DEFAULT_SHUTDOWN_TIMEOUT = 5000;
    private final SentryClient sentry;

    SentryTelemetryAdapter(SentryClient sentry) {
        this.sentry = sentry;
    }

    public void captureMessage(String message, String userId) {
        Map<String, String> options = new HashMap<>();
        options.put("level", "error");
        if (userId != null) options.put("user.id", userId);
        sentry.captureMessage(message, options);
    }

    public <T> T startSpan(String name, Supplier<T> fn) {
        return sentry.startSpan(name, fn);
    }

    public void shutdown() {
        sentry.close(DEFAULT_SHUTDOWN_TIMEOUT);
    }
}

public class TelemetryRegistry {
    private final List<TelemetryAdapter> adapters;

    public TelemetryRegistry(List<TelemetryAdapter> adapters) {
        this.adapters = adapters;
    }

    public void captureMessage(String message, String userId) {
        for (TelemetryAdapter adapter : adapters) adapter.captureMessage(message, userId);
    }

    public <T> T startSpan(String name, Supplier<T> fn) {
        return span(0, name, fn);
    }

    private <T> T span(int index, String name, Supplier<T> fn) {
        if (index == adapters.size()) return fn.get();
        return adapters.get(index).startSpan(name, () -> span(index + 1, name, fn));
    }

    public void shutdown() {
        for (TelemetryAdapter adapter : adapters) adapter.shutdown();
    }
}
