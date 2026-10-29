class Service:
    def __init__(self, repository, notifier): self.repository, self.notifier = repository, notifier
    def complete(self, identifier): self.repository.append(identifier); self.notifier.append("sent:" + identifier)
def demo():
    repository, notifier = [], []; Service(repository, notifier).complete("t1")
    return repository == ["t1"] and notifier == ["sent:t1"]

