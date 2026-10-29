class Rule:
    def __init__(self, successor=None):
        self.successor = successor

    def allows(self, amount, balance):
        return self.accepts(amount, balance) and (self.successor is None or self.successor.allows(amount, balance))


class Positive(Rule):
    def accepts(self, amount, balance):
        return amount > 0


class Funds(Rule):
    def accepts(self, amount, balance):
        return amount <= balance


class HighValue(Rule):
    def __init__(self, limit, successor=None):
        super().__init__(successor)
        if limit <= 0:
            raise ValueError("positive limit required")
        self.limit = limit

    def accepts(self, amount, balance):
        return amount <= self.limit
