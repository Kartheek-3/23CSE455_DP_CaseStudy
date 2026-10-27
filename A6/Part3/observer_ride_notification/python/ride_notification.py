"""Observer pattern: ride event notification (mirrors SocketNotificationService + Redis socket registry)."""
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Protocol


@dataclass(frozen=True)
class Event:
    type: str
    booking_id: str


class Observer(Protocol):
    def update(self, event: Event) -> None: ...


@dataclass
class RecordingObserver:
    """Stands in for a connected rider/driver socket."""

    received: List[Event] = field(default_factory=list)

    def update(self, event: Event) -> None:
        self.received.append(event)


class NotificationHub:
    """Subject: one observer per subscriber id; a reconnect replaces the old one."""

    def __init__(self) -> None:
        self._subscribers: Dict[str, Observer] = {}

    def subscribe(self, subscriber_id: str, observer: Observer) -> None:
        self._subscribers[subscriber_id] = observer

    def unsubscribe(self, subscriber_id: str) -> None:
        self._subscribers.pop(subscriber_id, None)

    def notify(self, subscriber_id: str, event: Event) -> bool:
        observer = self._subscribers.get(subscriber_id)
        if observer is None:
            return False
        observer.update(event)
        return True

    def broadcast(self, subscriber_ids: Iterable[str], event: Event) -> int:
        return sum(1 for sid in subscriber_ids if self.notify(sid, event))
