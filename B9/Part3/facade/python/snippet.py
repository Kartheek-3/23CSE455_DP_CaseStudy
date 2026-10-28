class Repository:
    def __init__(self): self.balance = {"a": 20, "b": 0}
class WalletFacade:
    def __init__(self, repo, notify): self.repo, self.notify = repo, notify
    def transfer(self, sender, receiver, amount):
        self.repo.balance[sender] -= amount; self.repo.balance[receiver] += amount; self.notify.append("completed")
def demo():
    repo, notices = Repository(), []; WalletFacade(repo, notices).transfer("a", "b", 10)
    return repo.balance == {"a": 10, "b": 10} and notices == ["completed"]

