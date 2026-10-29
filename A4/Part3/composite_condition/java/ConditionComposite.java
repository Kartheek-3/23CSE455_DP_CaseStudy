package composite;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public interface ConditionComposite {
    boolean evaluate(Map<String, Object> stateStore);

    class StateCondition implements ConditionComposite {
        private final String entityId;
        private final String expectedState;

        public StateCondition(String entityId, String expectedState) {
            this.entityId = entityId;
            this.expectedState = expectedState;
        }

        @Override
        public boolean evaluate(Map<String, Object> stateStore) {
            Object actual = stateStore.get(entityId);
            return actual != null && expectedState.equals(actual.toString());
        }
    }

    class NumericStateCondition implements ConditionComposite {
        private final String entityId;
        private final String operator;
        private final double threshold;

        public NumericStateCondition(String entityId, String operator, double threshold) {
            this.entityId = entityId;
            this.operator = operator;
            this.threshold = threshold;
        }

        @Override
        public boolean evaluate(Map<String, Object> stateStore) {
            Object val = stateStore.get(entityId);
            if (val == null) return false;
            double num;
            try {
                num = Double.parseDouble(val.toString());
            } catch (NumberFormatException e) {
                return false;
            }
            switch (operator) {
                case ">": return num > threshold;
                case ">=": return num >= threshold;
                case "<": return num < threshold;
                case "<=": return num <= threshold;
                case "==": return Math.abs(num - threshold) < 1e-9;
                default: return false;
            }
        }
    }

    class AndCondition implements ConditionComposite {
        private final List<ConditionComposite> children = new ArrayList<>();

        public AndCondition add(ConditionComposite child) {
            children.add(child);
            return this;
        }

        @Override
        public boolean evaluate(Map<String, Object> stateStore) {
            if (children.isEmpty()) return true;
            for (ConditionComposite child : children) {
                if (!child.evaluate(stateStore)) return false;
            }
            return true;
        }
    }

    class OrCondition implements ConditionComposite {
        private final List<ConditionComposite> children = new ArrayList<>();

        public OrCondition add(ConditionComposite child) {
            children.add(child);
            return this;
        }

        @Override
        public boolean evaluate(Map<String, Object> stateStore) {
            if (children.isEmpty()) return false;
            for (ConditionComposite child : children) {
                if (child.evaluate(stateStore)) return true;
            }
            return false;
        }
    }

    class NotCondition implements ConditionComposite {
        private final ConditionComposite child;

        public NotCondition(ConditionComposite child) {
            this.child = child;
        }

        @Override
        public boolean evaluate(Map<String, Object> stateStore) {
            return child == null || !child.evaluate(stateStore);
        }
    }
}
