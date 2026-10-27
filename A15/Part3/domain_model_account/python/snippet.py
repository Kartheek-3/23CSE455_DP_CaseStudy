class BadRequest(Exception):
    pass


class NotFound(Exception):
    pass


class Account:                                  # DomainObject: data AND the rules that protect it
    OVERDRAFT_LIMIT = 500.0

    def __init__(self, kind, balance):
        self.kind, self.balance = kind, balance

    def deposit(self, amount):
        if amount <= 0:
            raise BadRequest()
        self.balance += amount + (0.5 if self.kind == "S" else 0.0)

    def withdraw(self, amount):
        allowed = (self.balance - amount >= -self.OVERDRAFT_LIMIT) if self.kind == "C" else amount <= self.balance
        if amount <= 0 or not allowed:
            raise BadRequest()
        self.balance -= amount

    def credit(self, amount):
        if amount <= 0:
            raise BadRequest()
        self.balance += amount


class Bank:                                     # Orchestrator: loads, calls the domain object, nothing more
    def __init__(self):
        self.accounts, self.next = {}, 1

    def open(self, kind, balance):
        self.accounts[self.next] = Account(kind, balance)
        self.next += 1
        return self.next - 1

    def _find(self, id):
        if id not in self.accounts:
            raise NotFound(id)
        return self.accounts[id]

    def deposit(self, id, amount):
        account = self._find(id)
        account.deposit(amount)
        return account.balance

    def withdraw(self, id, amount):
        account = self._find(id)
        account.withdraw(amount)
        return account.balance

    def transfer(self, from_id, to_id, amount):
        if from_id == to_id or amount <= 0:
            raise BadRequest()
        source, target = self._find(from_id), self._find(to_id)
        source.withdraw(amount)                 # raises before anything is changed
        target.credit(amount)

    def balance(self, id):
        return self._find(id).balance
