class FixedRate:
    def convert(self, amount): return amount * 0.92
class SameCurrency:
    def convert(self, amount): return amount
class Factory:
    def select(self, source, target): return SameCurrency() if source == target else FixedRate()
def demo():
    factory=Factory(); return abs(factory.select("USD", "EUR").convert(10) - 9.2) < 1e-9 and factory.select("EUR", "EUR").convert(10) == 10

