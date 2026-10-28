package adapter;

/** Adaptee, modelled on JUnit's TestExecutionListener: the client-side interface, in terms of TestIdentifier. */
interface TestListener {

    default void testStarted(TestIdentifier identifier) {
    }

    default void testFinished(TestIdentifier identifier, String status) {
    }
}
