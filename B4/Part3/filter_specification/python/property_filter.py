from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class RentalProperty:
    id: int
    city: str
    rent: float
    available: bool
    amenities: tuple[str, ...]
    furnished: bool


class PropertySpecification(Protocol):
    def is_satisfied_by(self, property_: RentalProperty) -> bool: ...


@dataclass(frozen=True)
class CitySpecification:
    city: str
    def is_satisfied_by(self, property_: RentalProperty) -> bool:
        return property_.city.casefold() == self.city.casefold()


@dataclass(frozen=True)
class RentRangeSpecification:
    minimum: float
    maximum: float
    def __post_init__(self) -> None:
        if self.minimum < 0 or self.minimum > self.maximum:
            raise ValueError("Invalid range")
    def is_satisfied_by(self, property_: RentalProperty) -> bool:
        return self.minimum <= property_.rent <= self.maximum


@dataclass(frozen=True)
class AmenitySpecification:
    amenity: str
    def is_satisfied_by(self, property_: RentalProperty) -> bool:
        return self.amenity in property_.amenities


class AvailableSpecification:
    def is_satisfied_by(self, property_: RentalProperty) -> bool:
        return property_.available


class FurnishedSpecification:
    def is_satisfied_by(self, property_: RentalProperty) -> bool:
        return property_.furnished


@dataclass(frozen=True)
class AndSpecification:
    specifications: tuple[PropertySpecification, ...]
    def is_satisfied_by(self, property_: RentalProperty) -> bool:
        return all(spec.is_satisfied_by(property_) for spec in self.specifications)


def matching(properties: list[RentalProperty], specification: PropertySpecification) -> list[RentalProperty]:
    return [property_ for property_ in properties if specification.is_satisfied_by(property_)]

