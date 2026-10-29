class AmountCheck:
    def __init__(self, next_check=None): self.next = next_check
    def allow(self, transfer): return transfer["amount"] <= 1000 and (self.next is None or self.next.allow(transfer))
class DenyListCheck:
    def __init__(self, next_check=None): self.next = next_check
    def allow(self, transfer): return transfer["sender"] != "blocked" and (self.next is None or self.next.allow(transfer))
def demo():
    checks=DenyListCheck(AmountCheck()); return checks.allow({"sender": "a", "amount": 10}) and not checks.allow({"sender": "blocked", "amount": 10})

