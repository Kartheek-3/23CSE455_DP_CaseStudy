package nullobject;

/** Modelled on JUnit's EngineExecutionListener.NOOP (instance C7). */
interface TestListener {

    /** The null object: a real listener that does nothing. */
    TestListener NOOP = (name, outcome) -> {
    };

    void testFinished(String name, String outcome);
}
