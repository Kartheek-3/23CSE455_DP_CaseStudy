package factory;

final class SameThreadEngine extends TestEngine {
    String name() {
        return "same-thread engine";
    }

    Executor createExecutor() {
        return new SameThreadExecutor();
    }
}
