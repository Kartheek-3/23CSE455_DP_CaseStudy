"""Strategy pattern - late-fee policy. Mirrors FineStrategy.java behaviour.
Representative of PasswordEncoder strategy in SecurityConfiguration.java:57."""
from abc import ABC, abstractmethod


class FinePolicy(ABC):                       # Strategy
    @abstractmethod
    def fine(self, days_late: int) -> float:
        ...


class RegularFine(FinePolicy):               # ConcreteStrategy A
    def fine(self, days_late: int) -> float:
        return 0.0 if days_late <= 0 else days_late * 5.0


class AdvocateFine(FinePolicy):              # ConcreteStrategy B
    def fine(self, days_late: int) -> float:
        if days_late <= 0:
            return 0.0
        if days_late <= 7:
            return days_late * 2.0
        return 14.0 + (days_late - 7) * 3.0


class FineContext:                           # Context
    def __init__(self, policy: FinePolicy):
        self._policy = policy

    def set_policy(self, policy: FinePolicy):
        self._policy = policy

    def compute(self, days_late: int) -> float:
        return self._policy.fine(days_late)


def main():
    cases = [0, 3, 7, 10]
    ctx = FineContext(RegularFine())
    for d in cases:
        print(f"regular,{d},{ctx.compute(d):.2f}")
    ctx.set_policy(AdvocateFine())
    for d in cases:
        print(f"advocate,{d},{ctx.compute(d):.2f}")


if __name__ == "__main__":
    main()
