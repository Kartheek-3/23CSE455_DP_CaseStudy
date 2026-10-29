"""Observer pattern (GoF, behavioural) -- real-time occupancy notifications.

Production snippet. Tests live in test_observer.py.
"""

from abc import ABC, abstractmethod
from typing import List, Set


class OccupancyObserver(ABC):
    @abstractmethod
    def update(self, event: str) -> None:
        raise NotImplementedError


class AvailabilityObserver(OccupancyObserver):
    def __init__(self) -> None:
        self._occupied: Set[int] = set()

    def update(self, event: str) -> None:
        kind, raw_id = event.split(":")
        if kind == "occupy":
            self._occupied.add(int(raw_id))
        elif kind == "free":
            self._occupied.discard(int(raw_id))

    def count(self) -> int:
        return len(self._occupied)


class LoggingObserver(OccupancyObserver):
    def __init__(self) -> None:
        self.events: List[str] = []

    def update(self, event: str) -> None:
        self.events.append(event)


class OccupancyMonitor:
    def __init__(self) -> None:
        self._observers: List[OccupancyObserver] = []

    def attach(self, observer: OccupancyObserver) -> None:
        self._observers.append(observer)

    def detach(self, observer: OccupancyObserver) -> None:
        self._observers.remove(observer)

    def notify(self, event: str) -> int:
        for observer in self._observers:
            observer.update(event)
        return len(self._observers)
