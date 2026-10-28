from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class EntitySubscriptionObserver(ABC):
    @abstractmethod
    def on_entity_update(
        self, entity_id: str, state: str, attributes: Dict[str, Any]
    ) -> None:
        pass


class EntityRecord:
    def __init__(
        self, entity_id: str, state: str, attributes: Optional[Dict[str, Any]] = None
    ):
        self.entity_id = entity_id
        self.state = state
        self.attributes = dict(attributes) if attributes else {}


class EntityHub:
    def __init__(self):
        self.entity_states: Dict[str, EntityRecord] = {}
        self.observers: List[EntitySubscriptionObserver] = []

    def subscribe(self, observer: EntitySubscriptionObserver) -> None:
        if observer not in self.observers:
            self.observers.append(observer)

    def unsubscribe(self, observer: EntitySubscriptionObserver) -> None:
        if observer in self.observers:
            self.observers.remove(observer)

    def update_entity(
        self, entity_id: str, state: str, attributes: Optional[Dict[str, Any]] = None
    ) -> None:
        record = EntityRecord(entity_id, state, attributes)
        self.entity_states[entity_id] = record
        self._notify_observers(entity_id, state, record.attributes)

    def _notify_observers(
        self, entity_id: str, state: str, attributes: Dict[str, Any]
    ) -> None:
        for observer in list(self.observers):
            observer.on_entity_update(entity_id, state, attributes)

    def get_entity(self, entity_id: str) -> Optional[EntityRecord]:
        return self.entity_states.get(entity_id)

    @property
    def observer_count(self) -> int:
        return len(self.observers)
