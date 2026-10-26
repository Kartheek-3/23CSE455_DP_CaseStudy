"""Strategy pattern (GoF, behavioural) -- pluggable parking-slot allocation.

Production snippet. Tests live in test_strategy.py.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Slot:
    id: int
    slot_number: str
    floor: int
    type: str  # "standard" | "ev"
    distance_to_entrance: int


class SlotAllocationStrategy(ABC):
    @abstractmethod
    def name(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def choose(self, slots: List[Slot]) -> Optional[Slot]:
        raise NotImplementedError


class FirstAvailableStrategy(SlotAllocationStrategy):
    def name(self) -> str:
        return "first-available"

    def choose(self, slots: List[Slot]) -> Optional[Slot]:
        return slots[0] if slots else None


class NearestToEntranceStrategy(SlotAllocationStrategy):
    def name(self) -> str:
        return "nearest-to-entrance"

    def choose(self, slots: List[Slot]) -> Optional[Slot]:
        best: Optional[Slot] = None
        for slot in slots:
            if best is None or slot.distance_to_entrance < best.distance_to_entrance:
                best = slot
        return best


class EvPreferredStrategy(SlotAllocationStrategy):
    def name(self) -> str:
        return "ev-preferred"

    def choose(self, slots: List[Slot]) -> Optional[Slot]:
        ev_slots = [s for s in slots if s.type == "ev"]
        pool = ev_slots if ev_slots else slots
        best: Optional[Slot] = None
        for slot in pool:
            if best is None or slot.distance_to_entrance < best.distance_to_entrance:
                best = slot
        return best


class SlotAllocator:
    def __init__(self, strategy: SlotAllocationStrategy) -> None:
        self._strategy = strategy

    def set_strategy(self, strategy: SlotAllocationStrategy) -> None:
        self._strategy = strategy

    def allocate(self, slots: List[Slot]) -> Optional[Slot]:
        return self._strategy.choose(slots)
