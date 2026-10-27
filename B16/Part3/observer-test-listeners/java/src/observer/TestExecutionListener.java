package observer;

/**
 * Observer interface, modelled on JUnit's TestExecutionListener.
 * Every callback has an empty default, so a listener overrides only what it needs.
 */
public interface TestExecutionListener {

    default void executionStarted(String testId) {
    }

    default void executionSkipped(String testId, String reason) {
    }

    default void executionFinished(String testId, Status status) {
    }
}
