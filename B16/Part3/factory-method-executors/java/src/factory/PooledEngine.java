package factory;

final class PooledEngine extends TestEngine {
    String name() {
        return "pooled engine";
    }

    Executor createExecutor() {
        return new PooledExecutor(2);
    }
}
