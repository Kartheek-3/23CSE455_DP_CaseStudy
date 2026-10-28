package strategy;

/** Strategy, modelled on JUnit's PostDiscoveryFilter (instance A3): decides whether one test is selected. */
interface TestFilter {

    boolean includes(TestCase test);

    String describe();
}
