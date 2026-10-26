from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, Optional, Union


class ConditionStrategy(ABC):
    @abstractmethod
    def evaluate(
        self,
        condition_data: Dict[str, Any],
        state_store: Dict[str, Any],
        context: Dict[str, Any],
    ) -> bool:
        pass


class StateStrategy(ConditionStrategy):
    def evaluate(
        self,
        condition_data: Dict[str, Any],
        state_store: Dict[str, Any],
        context: Dict[str, Any],
    ) -> bool:
        entity = condition_data.get("entity")
        expected = condition_data.get("expected")
        actual = state_store.get(entity)
        return actual is not None and str(actual) == str(expected)


class NumericStrategy(ConditionStrategy):
    def evaluate(
        self,
        condition_data: Dict[str, Any],
        state_store: Dict[str, Any],
        context: Dict[str, Any],
    ) -> bool:
        entity = condition_data.get("entity")
        op = condition_data.get("op")
        threshold = float(condition_data.get("threshold", 0.0))

        val = state_store.get(entity)
        if val is None:
            return False
        try:
            num = float(val)
        except (ValueError, TypeError):
            return False

        if op == ">":
            return num > threshold
        elif op == ">=":
            return num >= threshold
        elif op == "<":
            return num < threshold
        elif op == "<=":
            return num <= threshold
        elif op == "==":
            return abs(num - threshold) < 1e-9
        return False


class ScreenStrategy(ConditionStrategy):
    def evaluate(
        self,
        condition_data: Dict[str, Any],
        state_store: Dict[str, Any],
        context: Dict[str, Any],
    ) -> bool:
        width = int(context.get("screenWidth", 0))
        min_w = int(condition_data.get("minWidth", 0))
        max_w = int(condition_data.get("maxWidth", 1000000))
        return min_w <= width <= max_w


StrategyTarget = Union[
    ConditionStrategy,
    Callable[[Dict[str, Any], Dict[str, Any], Dict[str, Any]], bool],
]


class EvaluatorContext:
    def __init__(self):
        self.strategies: Dict[str, StrategyTarget] = {}
        self.register("state", StateStrategy())
        self.register("numeric", NumericStrategy())
        self.register("screen", ScreenStrategy())

    def register(self, cond_type: str, strategy: StrategyTarget) -> None:
        self.strategies[cond_type] = strategy

    def evaluate(
        self,
        condition_data: Dict[str, Any],
        state_store: Dict[str, Any],
        context: Dict[str, Any],
    ) -> bool:
        cond_type = condition_data.get("type")
        strategy = self.strategies.get(cond_type)
        if strategy is None:
            return False
        if isinstance(strategy, ConditionStrategy):
            return strategy.evaluate(condition_data, state_store, context)
        return strategy(condition_data, state_store, context)
