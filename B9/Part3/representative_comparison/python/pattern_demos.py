from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

class FixedRate:
    def convert(self, money, target): return Money(money.amount * Decimal("0.92"), target)

class SameCurrency:
    def convert(self, money, target):
        if money.currency != target: raise ValueError("currency mismatch")
        return money

class ConversionFactory:
    def select(self, source, target): return SameCurrency() if source == target else FixedRate()

class Publisher:
    def __init__(self): self.observers = []
    def subscribe(self, observer): self.observers.append(observer)
    def publish(self, identifier):
        for observer in self.observers: observer(identifier)

if __name__ == "__main__":
    factory = ConversionFactory()
    converted = factory.select("USD", "EUR").convert(Money(Decimal("10"), "USD"), "EUR")
    assert converted.amount == Decimal("9.20")
    same = factory.select("EUR", "EUR").convert(Money(Decimal("10"), "EUR"), "EUR")
    assert same == Money(Decimal("10"), "EUR")
    seen = []
    publisher = Publisher(); publisher.subscribe(lambda t: seen.append("email:" + t)); publisher.subscribe(lambda t: seen.append("audit:" + t)); publisher.publish("t1")
    assert len(seen) == 2
    assert seen == ["email:t1", "audit:t1"]
    print("4/4 passed")
