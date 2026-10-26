package decorator;

/** Component, modelled on JUnit's Invocation (instance D10). */
interface Invocation {

    String name();

    int durationMs();

    String proceed();
}
