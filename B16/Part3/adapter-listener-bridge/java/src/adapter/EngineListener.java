package adapter;

/** Target, modelled on JUnit's EngineExecutionListener (instance B7): what the engine calls, with raw unique ids. */
interface EngineListener {

    void executionStarted(String uniqueId);

    void executionFinished(String uniqueId, String status);
}
