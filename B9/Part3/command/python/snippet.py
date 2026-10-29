class Wallet:
    def __init__(self, balance): self.balance = balance
class TransferCommand:
    def __init__(self, sender, receiver, amount): self.sender, self.receiver, self.amount = sender, receiver, amount
    def execute(self): self.sender.balance -= self.amount; self.receiver.balance += self.amount
def demo():
    sender, receiver = Wallet(20), Wallet(0); command = TransferCommand(sender, receiver, 10); command.execute()
    return sender.balance == 10 and receiver.balance == 10

