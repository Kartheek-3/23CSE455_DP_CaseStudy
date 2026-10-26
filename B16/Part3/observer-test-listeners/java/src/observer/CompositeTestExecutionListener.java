package observer;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

/**
 * Holds the registered observers and forwards every event to each of them.
 * Like JUnit's CompositeTestExecutionListener.notifyEach, a listener that throws
 * is recorded in {@link #failures()} and the remaining listeners still get the event.
 */
public final class CompositeTestExecutionListener implements TestExecutionListener {

    private final List<TestExecutionListener> listeners = new ArrayList<>();
    private final List<String> failures = new ArrayList<>();

    public void register(TestExecutionListener listener) {
        listeners.add(Objects.requireNonNull(listener));
    }

    public List<String> failures() {
        return List.copyOf(failures);
    }

    @Override
    public void executionStarted(String testId) {
        notifyEach("started " + testId, listener -> listener.executionStarted(testId));
    }

    @Override
    public void executionSkipped(String testId, String reason) {
        notifyEach("skipped " + testId, listener -> listener.executionSkipped(testId, reason));
    }

    @Override
    public void executionFinished(String testId, Status status) {
        notifyEach("finished " + testId, listener -> listener.executionFinished(testId, status));
    }

    private void notifyEach(String event, Consumer<TestExecutionListener> call) {
        for (TestExecutionListener listener : listeners) {
            try {
                call.accept(listener);
            }
            catch (RuntimeException e) {
                failures.add(listener.getClass().getSimpleName() + " failed on " + event + ": " + e.getMessage());
            }
        }
    }
}
