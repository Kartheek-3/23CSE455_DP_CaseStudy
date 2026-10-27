package strategy;

import java.util.HashMap;
import java.util.Map;

public interface ConditionStrategy {
    boolean evaluate(Map<String, Object> conditionData, Map<String, Object> stateStore, Map<String, Object> context);

    class StateStrategy implements ConditionStrategy {
        @Override
        public boolean evaluate(Map<String, Object> conditionData, Map<String, Object> stateStore, Map<String, Object> context) {
            String entity = (String) conditionData.get("entity");
            String expected = (String) conditionData.get("expected");
            Object actual = stateStore.get(entity);
            return actual != null && expected.equals(actual.toString());
        }
    }

    class NumericStrategy implements ConditionStrategy {
        @Override
        public boolean evaluate(Map<String, Object> conditionData, Map<String, Object> stateStore, Map<String, Object> context) {
            String entity = (String) conditionData.get("entity");
            String op = (String) conditionData.get("op");
            double threshold = ((Number) conditionData.get("threshold")).doubleValue();

            Object val = stateStore.get(entity);
            if (val == null) return false;
            double num = ((Number) val).doubleValue();

            switch (op) {
                case ">": return num > threshold;
                case ">=": return num >= threshold;
                case "<": return num < threshold;
                case "<=": return num <= threshold;
                case "==": return Math.abs(num - threshold) < 1e-9;
                default: return false;
            }
        }
    }

    class ScreenStrategy implements ConditionStrategy {
        @Override
        public boolean evaluate(Map<String, Object> conditionData, Map<String, Object> stateStore, Map<String, Object> context) {
            int width = ((Number) context.getOrDefault("screenWidth", 0)).intValue();
            int min = ((Number) conditionData.getOrDefault("minWidth", 0)).intValue();
            int max = ((Number) conditionData.getOrDefault("maxWidth", Integer.MAX_VALUE)).intValue();
            return width >= min && width <= max;
        }
    }

    class EvaluatorContext {
        private final Map<String, ConditionStrategy> strategies = new HashMap<>();

        public EvaluatorContext() {
            register("state", new StateStrategy());
            register("numeric", new NumericStrategy());
            register("screen", new ScreenStrategy());
        }

        public void register(String type, ConditionStrategy strategy) {
            strategies.put(type, strategy);
        }

        public boolean evaluate(Map<String, Object> conditionData, Map<String, Object> stateStore, Map<String, Object> context) {
            String type = (String) conditionData.get("type");
            ConditionStrategy strategy = strategies.get(type);
            if (strategy == null) return false;
            return strategy.evaluate(conditionData, stateStore, context);
        }
    }
}
