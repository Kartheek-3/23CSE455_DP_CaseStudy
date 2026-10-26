"""Layered Architecture pattern -- presentation/business/data layers with
downward-only dependencies.

Production snippet. Tests live in test_layered_architecture.py.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Reservation:
    slot_id: int
    plate: str


# Data layer
class ReservationRepository:
    def __init__(self) -> None:
        self._items: List[Reservation] = []

    def save(self, reservation: Reservation) -> Reservation:
        self._items.append(reservation)
        return reservation

    def count(self) -> int:
        return len(self._items)

    def find_by_plate(self, plate: str) -> Optional[Reservation]:
        for item in self._items:
            if item.plate == plate:
                return item
        return None


# Business layer (depends on the data layer)
class ParkingService:
    def __init__(self, repository: ReservationRepository) -> None:
        self._repository = repository

    def reserve(self, slot_id: int, plate: str) -> Reservation:
        return self._repository.save(Reservation(slot_id, plate))

    def reservations(self) -> int:
        return self._repository.count()


# Presentation layer (depends on the business layer)
class ParkingController:
    def __init__(self, service: ParkingService) -> None:
        self._service = service

    def post_reservation(self, slot_id: int, plate: str) -> str:
        if slot_id <= 0:
            return "ERR:invalid-slot"
        self._service.reserve(slot_id, plate)
        return "OK:" + str(slot_id) + ":" + plate
