from dataclasses import dataclass
@dataclass(frozen=True)
class Money:
    amount: int
    currency: str
    def __post_init__(self):
        if self.amount < 0 or not self.currency: raise ValueError("invalid money")
def demo():
    return Money(10, "EUR") == Money(10, "EUR") and Money(10, "EUR") != Money(10, "USD")

