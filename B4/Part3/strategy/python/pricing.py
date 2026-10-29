from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Property:
    base_rent: float


@dataclass(frozen=True)
class PricingContext:
    month: int
    occupancy_rate: float
    lease_months: int

    def __post_init__(self) -> None:
        if not 1 <= self.month <= 12 or not 0 <= self.occupancy_rate <= 1 or self.lease_months < 1:
            raise ValueError("Invalid pricing context")


class PricingStrategy(Protocol):
    def price(self, property_: Property, context: PricingContext) -> float: ...


class BasePricing:
    def price(self, property_: Property, context: PricingContext) -> float:
        return round(property_.base_rent, 2)


class DynamicPricing:
    def price(self, property_: Property, context: PricingContext) -> float:
        multiplier = 1.0
        if context.month in (4, 5, 12):
            multiplier += 0.20
        if context.occupancy_rate >= 0.80:
            multiplier += 0.10
        if context.lease_months >= 12:
            multiplier -= 0.05
        return round(property_.base_rent * multiplier, 2)


class PricingService:
    def __init__(self, strategy: PricingStrategy) -> None:
        self.strategy = strategy

    def use(self, strategy: PricingStrategy) -> None:
        self.strategy = strategy

    def quote(self, property_: Property, context: PricingContext) -> float:
        return self.strategy.price(property_, context)

