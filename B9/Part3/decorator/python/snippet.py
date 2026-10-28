class PerTransferLimit:
    def allow(self, amount): return amount <= 1000
class DailyLimit:
    def __init__(self, wrapped): self.wrapped, self.used = wrapped, 0
    def allow(self, amount):
        if not self.wrapped.allow(amount) or self.used + amount > 1000: return False
        self.used += amount; return True
def demo():
    policy=DailyLimit(PerTransferLimit()); return policy.allow(600) and not policy.allow(500)

