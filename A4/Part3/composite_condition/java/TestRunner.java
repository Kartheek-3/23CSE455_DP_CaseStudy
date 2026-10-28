package composite;

import java.util.HashMap;
import java.util.Map;

public class TestRunner {
    public static void main(String[] args) {
        long start = System.nanoTime();

        Map<String, Object> stateStore = new HashMap<>();
        stateStore.put("light.living_room", "on");
        stateStore.put("climate.ac", "cool");
        stateStore.put("sensor.temperature", 24.5);
        stateStore.put("binary_sensor.motion", "off");

        int passed = 0;
        int total = 6;

        // Test 1: Leaf State Condition (True)
        ConditionComposite c1 = new ConditionComposite.StateCondition("light.living_room", "on");
        if (c1.evaluate(stateStore)) passed++;

        // Test 2: Leaf Numeric Condition (False)
        ConditionComposite c2 = new ConditionComposite.NumericStateCondition("sensor.temperature", ">", 30.0);
        if (!c2.evaluate(stateStore)) passed++;

        // Test 3: Composite AND (True)
        ConditionComposite.AndCondition c3 = new ConditionComposite.AndCondition();
        c3.add(new ConditionComposite.StateCondition("light.living_room", "on"))
          .add(new ConditionComposite.NumericStateCondition("sensor.temperature", ">=", 20.0));
        if (c3.evaluate(stateStore)) passed++;

        // Test 4: Composite OR (False)
        ConditionComposite.OrCondition c4 = new ConditionComposite.OrCondition();
        c4.add(new ConditionComposite.NumericStateCondition("sensor.temperature", "<", 20.0))
          .add(new ConditionComposite.StateCondition("binary_sensor.motion", "on"));
        if (!c4.evaluate(stateStore)) passed++;

        // Test 5: Composite NOT (True)
        ConditionComposite c5 = new ConditionComposite.NotCondition(
            new ConditionComposite.StateCondition("binary_sensor.motion", "on")
        );
        if (c5.evaluate(stateStore)) passed++;

        // Test 6: Nested Composite AND(state, OR(numeric, NOT(state))) (True)
        ConditionComposite.AndCondition c6 = new ConditionComposite.AndCondition();
        ConditionComposite.OrCondition orBranch = new ConditionComposite.OrCondition();
        orBranch.add(new ConditionComposite.NumericStateCondition("sensor.temperature", ">", 25.0))
                .add(new ConditionComposite.NotCondition(new ConditionComposite.StateCondition("binary_sensor.motion", "on")));
        c6.add(new ConditionComposite.StateCondition("light.living_room", "on"))
          .add(orBranch);
        if (c6.evaluate(stateStore)) passed++;

        long elapsedNanos = System.nanoTime() - start;
        double elapsedMs = elapsedNanos / 1_000_000.0;

        System.out.printf("RESULT: %d/%d passed\n", passed, total);
        System.out.printf("TIME_MS: %.3f\n", elapsedMs);

        if (passed != total) {
            System.exit(1);
        }
    }
}
