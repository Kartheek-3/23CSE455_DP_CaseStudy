class Pending:
    def next(self): return Completed()
class Completed:
    def next(self): raise RuntimeError("terminal")
class Transaction:
    def __init__(self): self.state = Pending()
    def complete(self): self.state = self.state.next()
def demo():
    transaction=Transaction(); transaction.complete()
    try: transaction.complete()
    except RuntimeError: return isinstance(transaction.state, Completed)
    return False

