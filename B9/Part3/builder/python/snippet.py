class Transfer:
    def __init__(self, sender, receiver, amount): self.sender, self.receiver, self.amount = sender, receiver, amount
class TransferBuilder:
    def __init__(self): self.sender = self.receiver = None; self.amount = None
    def from_(self, sender): self.sender = sender; return self
    def to(self, receiver): self.receiver = receiver; return self
    def for_amount(self, amount): self.amount = amount; return self
    def build(self):
        if not all((self.sender, self.receiver, self.amount)): raise ValueError("missing field")
        return Transfer(self.sender, self.receiver, self.amount)
def demo():
    transfer = TransferBuilder().from_("a").to("b").for_amount(10).build()
    return (transfer.sender, transfer.receiver, transfer.amount) == ("a", "b", 10)

