"""Strategy pattern: ride fare per ride type (mirrors Part2 src/domain/pricing/FareStrategy.ts)."""
import math
from dataclasses import dataclass
from typing import Dict, Protocol


@dataclass(frozen=True)
class Trip:
    ride_type: str
    km: float = 0
    days: int = 0
    hours: float = 0


class FareError(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


class FareStrategy(Protocol):
    def calculate(self, trip: Trip) -> int: ...


class OneWayFare:
    def calculate(self, trip: Trip) -> int:
        if trip.km <= 0:
            raise FareError("INVALID_INPUT")
        return round(max(450, trip.km * 10))


class RoundTripFare:
    def calculate(self, trip: Trip) -> int:
        if trip.days < 1:
            raise FareError("INVALID_INPUT")
        return trip.days * 1000


class HourlyFare:
    def calculate(self, trip: Trip) -> int:
        if trip.hours <= 0:
            raise FareError("INVALID_INPUT")
        return max(4, math.ceil(trip.hours)) * 200


class OutstationFare:
    def calculate(self, trip: Trip) -> int:
        if trip.km <= 0 or trip.days < 1:
            raise FareError("INVALID_INPUT")
        return round(trip.km * 12 + trip.days * 300)


class FareCalculator:
    """Context: registry of strategies keyed by ride type."""

    def __init__(self) -> None:
        self._strategies: Dict[str, FareStrategy] = {}
        self.register("ONE_WAY", OneWayFare())
        self.register("ROUND_TRIP", RoundTripFare())
        self.register("HOURLY", HourlyFare())
        self.register("OUTSTATION", OutstationFare())

    def register(self, ride_type: str, strategy: FareStrategy) -> None:
        self._strategies[ride_type] = strategy

    def calculate(self, trip: Trip) -> int:
        strategy = self._strategies.get(trip.ride_type)
        if strategy is None:
            raise FareError("UNKNOWN_RIDE_TYPE")
        return strategy.calculate(trip)
