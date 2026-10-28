"""State pattern (GoF, behavioural) -- EV charging session lifecycle.

Production snippet. Tests live in test_state.py.
"""


class ChargingSessionState:
    def name(self) -> str:
        raise NotImplementedError

    def plug_in(self, ctx) -> str:
        return ctx.fail("plugIn", self.name())

    def start_charge(self, ctx) -> str:
        return ctx.fail("startCharge", self.name())

    def finish_charge(self, ctx) -> str:
        return ctx.fail("finishCharge", self.name())

    def remove_cable(self, ctx) -> str:
        return ctx.fail("removeCable", self.name())


class IdleState(ChargingSessionState):
    def name(self) -> str:
        return "idle"

    def plug_in(self, ctx) -> str:
        ctx.set_state(PluggedInState())
        return "plugged_in"


class PluggedInState(ChargingSessionState):
    def name(self) -> str:
        return "plugged_in"

    def start_charge(self, ctx) -> str:
        ctx.set_state(ChargingActiveState())
        return "charging"

    def remove_cable(self, ctx) -> str:
        ctx.set_state(IdleState())
        return "idle"


class ChargingActiveState(ChargingSessionState):
    def name(self) -> str:
        return "charging"

    def finish_charge(self, ctx) -> str:
        ctx.set_state(CompletedState())
        return "completed"


class CompletedState(ChargingSessionState):
    def name(self) -> str:
        return "completed"

    def remove_cable(self, ctx) -> str:
        ctx.set_state(IdleState())
        return "idle"


class ChargingSession:
    def __init__(self) -> None:
        self._state = IdleState()
        self.errors = []

    def set_state(self, state: ChargingSessionState) -> None:
        self._state = state

    def state(self) -> str:
        return self._state.name()

    def fail(self, event: str, from_state: str) -> str:
        self.errors.append(f"{event}@{from_state}")
        return "error"

    def plug_in(self) -> str:
        return self._state.plug_in(self)

    def start_charge(self) -> str:
        return self._state.start_charge(self)

    def finish_charge(self) -> str:
        return self._state.finish_charge(self)

    def remove_cable(self) -> str:
        return self._state.remove_cable(self)
