class StandardDiscount:
    def apply(self, amount_cents: int) -> int:
        return amount_cents * 90 // 100


class PremiumDiscount:
    def apply(self, amount_cents: int) -> int:
        return amount_cents * 80 // 100


class PriceCalculator:
    def __init__(self, strategy):
        self.strategy = strategy

    def total(self, amount_cents: int) -> int:
        return self.strategy.apply(amount_cents)


def results() -> tuple[int, int]:
    return (PriceCalculator(StandardDiscount()).total(10000),
            PriceCalculator(PremiumDiscount()).total(10000))


if __name__ == "__main__":
    standard, premium = results()
    print(f"standard={standard};premium={premium}")
