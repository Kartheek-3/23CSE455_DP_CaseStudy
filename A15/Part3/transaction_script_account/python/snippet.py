class BadRequest(Exception):
    pass


class NotFound(Exception):
    pass


class Row:                                      # RowData: data only, no behaviour (anemic)
    def __init__(self, kind, balance):
        self.kind, self.balance = kind, balance


class AccountScripts:                           # host of the TransactionScripts: one procedure per use case
    def __init__(self):
        self.rows, self.next = {}, 1

    def open(self, kind, balance):
        self.rows[self.next] = Row(kind, balance)
        self.next += 1
        return self.next - 1

    def _find(self, id):
        if id not in self.rows:
            raise NotFound(id)
        return self.rows[id]

    def deposit(self, id, amount):              # script: all rules are inline
        row = self._find(id)
        if amount > 0:
            new_balance = row.balance + amount
            if row.kind == "S":
                new_balance += 0.5
            row.balance = new_balance
            return new_balance
        raise BadRequest()

    def withdraw(self, id, amount):             # script: all rules are inline
        row = self._find(id)
        if amount > 0 and row.balance > amount:
            row.balance -= amount
            return row.balance
        raise BadRequest()
