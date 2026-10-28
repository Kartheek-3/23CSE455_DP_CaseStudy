class WalletRepository:
    def __init__(self): self.items = {}
    def save(self, wallet): self.items[wallet["id"]] = wallet
    def find(self, identifier): return self.items.get(identifier)
def demo():
    repo = WalletRepository(); repo.save({"id": "a", "balance": 10})
    return repo.find("a") == {"id": "a", "balance": 10} and repo.find("missing") is None

