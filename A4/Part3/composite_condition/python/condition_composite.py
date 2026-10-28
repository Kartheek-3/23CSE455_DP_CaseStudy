from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ConditionComposite(ABC):
    @abstractmethod
    def evaluate(self, state_store: Dict[str, Any]) -> bool:
        pass


class StateCondition(ConditionComposite):
    def __init__(self, entity_id: str, expected_state: str):
        self.entity_id = entity_id
        self.expected_state = expected_state

    def evaluate(self, state_store: Dict[str, Any]) -> bool:
        actual = state_store.get(self.entity_id)
        return actual is not None and str(actual) == self.expected_state


class NumericStateCondition(ConditionComposite):
    def __init__(self, entity_id: str, operator: str, threshold: float):
        self.entity_id = entity_id
        self.operator = operator
        self.threshold = threshold

    def evaluate(self, state_store: Dict[str, Any]) -> bool:
        val = state_store.get(self.entity_id)
        if val is None:
            return False
        try:
            num = float(val)
        except (ValueError, TypeError):
            return False

        if self.operator == ">":
            return num > self.threshold
        elif self.operator == ">=":
            return num >= self.threshold
        elif self.operator == "<":
            return num < self.threshold
        elif self.operator == "<=":
            return num <= self.threshold
        elif self.operator == "==":
            return abs(num - self.threshold) < 1e-9
        return False


class AndCondition(ConditionComposite):
    def __init__(self, children: Optional[List[ConditionComposite]] = None):
        self.children: List[ConditionComposite] = children if children is not None else []

    def add(self, child: ConditionComposite) -> "AndCondition":
        self.children.append(child)
        return self

    def evaluate(self, state_store: Dict[str, Any]) -> bool:
        if not self.children:
            return True
        return all(child.evaluate(state_store) for child in self.children)


class OrCondition(ConditionComposite):
    def __init__(self, children: Optional[List[ConditionComposite]] = None):
        self.children: List[ConditionComposite] = children if children is not None else []

    def add(self, child: ConditionComposite) -> "OrCondition":
        self.children.append(child)
        return self

    def evaluate(self, state_store: Dict[str, Any]) -> bool:
        if not self.children:
            return False
        return any(child.evaluate(state_store) for child in self.children)


class NotCondition(ConditionComposite):
    def __init__(self, child: Optional[ConditionComposite] = None):
        self.child = child

    def evaluate(self, state_store: Dict[str, Any]) -> bool:
        if self.child is None:
            return True
        return not self.child.evaluate(state_store)
