from dataclasses import dataclass
from typing import Optional


@dataclass
class Shipment:
    shipment_id: int
    shipment_number: str
    status: str


class ShipmentRepository:
    def __init__(self):
        self._shipments = {}

    def save(self, shipment: Shipment) -> None:
        self._shipments[shipment.shipment_id] = shipment

    def find_by_id(self, shipment_id: int) -> Optional[Shipment]:
        return self._shipments.get(shipment_id)

    def find_all(self) -> list[Shipment]:
        return list(self._shipments.values())


def main():
    repository = ShipmentRepository()

    repository.save(Shipment(1, "SHP-001", "planned"))
    repository.save(Shipment(2, "SHP-002", "in_transit"))

    shipment = repository.find_by_id(2)
    shipments = repository.find_all()

    assert shipment is not None
    assert shipment.shipment_number == "SHP-002"
    assert len(shipments) == 2

    print("Repository Pattern: PASS")
    print(f"Found shipment: {shipment.shipment_number}")
    print(f"Total shipments: {len(shipments)}")


if __name__ == "__main__":
    main()
