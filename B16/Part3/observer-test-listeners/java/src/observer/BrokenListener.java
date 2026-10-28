package observer;

/** A listener that throws on every event, to show the others are not affected. */
public final class BrokenListener implements TestExecutionListener {

    @Override
    public void executionStarted(String testId) {
        throw new IllegalStateException("listener is broken");
    }

    @Override
    public void executionSkipped(String testId, String reason) {
        throw new IllegalStateException("listener is broken");
    }

    @Override
    public void executionFinished(String testId, Status status) {
        throw new IllegalStateException("listener is broken");
    }
}
