"""State pattern: trip lifecycle (mirrors Part2 src/domain/booking/TripState.ts)."""


class InvalidTransition(Exception):
    pass


class TripState:
    """Base state: every event is refused unless a concrete state overrides it."""

    name = "?"

    def _refuse(self, event: str) -> "TripState":
        raise InvalidTransition(f"INVALID_TRANSITION: cannot {event} when {self.name}")

    def accept(self) -> "TripState":
        return self._refuse("accept")

    def complete(self) -> "TripState":
        return self._refuse("complete")

    def cancel(self) -> "TripState":
        return self._refuse("cancel")

    def reject(self) -> "TripState":
        return self._refuse("reject")

    def expire(self) -> "TripState":
        return self._refuse("expire")


class Pending(TripState):
    name = "PENDING"

    def accept(self):
        return Confirmed()

    def cancel(self):
        return Finished("CANCELLED")

    def reject(self):
        return Finished("REJECTED")

    def expire(self):
        return Finished("EXPIRED")


class Confirmed(TripState):
    name = "CONFIRMED"

    def complete(self):
        return Finished("COMPLETED")

    def cancel(self):
        return Finished("CANCELLED")

    def reject(self):
        return Finished("REJECTED")


class Finished(TripState):
    """COMPLETED, CANCELLED, REJECTED and EXPIRED accept no events."""

    def __init__(self, name: str):
        self.name = name


EVENTS = ("accept", "complete", "cancel", "reject", "expire")


class Trip:
    """Context."""

    def __init__(self) -> None:
        self._state: TripState = Pending()

    @property
    def status(self) -> str:
        return self._state.name

    def apply(self, event: str) -> None:
        if event not in EVENTS:
            raise ValueError(f"unknown event {event}")
        self._state = getattr(self._state, event)()
