package strategy;

import java.util.HashMap;
import java.util.Map;

public class TestRunner {
    public static void main(String[] args) {
        long start = System.nanoTime();

        ConditionStrategy.EvaluatorContext context = new ConditionStrategy.EvaluatorContext();

        Map<String, Object> stateStore = new HashMap<>();
        stateStore.put("light.patio", "on");
        stateStore.put("sensor.lux", 150.0);
        stateStore.put("device.battery", 85.0);

        Map<String, Object> envContext = new HashMap<>();
        envContext.put("screenWidth", 1024);

        int passed = 0;
        int total = 6;

        // Test 1: Strategy state (True)
        Map<String, Object> cond1 = new HashMap<>();
        cond1.put("type", "state");
        cond1.put("entity", "light.patio");
        cond1.put("expected", "on");
        if (context.evaluate(cond1, stateStore, envContext)) passed++;

        // Test 2: Strategy state (False)
        Map<String, Object> cond2 = new HashMap<>();
        cond2.put("type", "state");
        cond2.put("entity", "light.patio");
        cond2.put("expected", "off");
        if (!context.evaluate(cond2, stateStore, envContext)) passed++;

        // Test 3: Strategy numeric > 100 (True)
        Map<String, Object> cond3 = new HashMap<>();
        cond3.put("type", "numeric");
        cond3.put("entity", "sensor.lux");
        cond3.put("op", ">");
        cond3.put("threshold", 100.0);
        if (context.evaluate(cond3, stateStore, envContext)) passed++;

        // Test 4: Strategy numeric <= 20 (False)
        Map<String, Object> cond4 = new HashMap<>();
        cond4.put("type", "numeric");
        cond4.put("entity", "device.battery");
        cond4.put("op", "<=");
        cond4.put("threshold", 20.0);
        if (!context.evaluate(cond4, stateStore, envContext)) passed++;

        // Test 5: Strategy screen range 768-1200 (True)
        Map<String, Object> cond5 = new HashMap<>();
        cond5.put("type", "screen");
        cond5.put("minWidth", 768);
        cond5.put("maxWidth", 1200);
        if (context.evaluate(cond5, stateStore, envContext)) passed++;

        // Test 6: Custom pluggable strategy "battery_ok" (True)
        context.register("battery_ok", (data, states, env) -> {
            Object val = states.get("device.battery");
            return val != null && ((Number) val).doubleValue() > 50.0;
        });
        Map<String, Object> cond6 = new HashMap<>();
        cond6.put("type", "battery_ok");
        if (context.evaluate(cond6, stateStore, envContext)) passed++;

        long elapsedNanos = System.nanoTime() - start;
        double elapsedMs = elapsedNanos / 1_000_000.0;

        System.out.printf("RESULT: %d/%d passed\n", passed, total);
        System.out.printf("TIME_MS: %.3f\n", elapsedMs);

        if (passed != total) {
            System.exit(1);
        }
    }
}
