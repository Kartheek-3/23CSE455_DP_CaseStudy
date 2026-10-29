class NotFound(Exception):
    pass


class Account:                              # TransferObject
    def __init__(self, id, balance):
        self.id, self.balance = id, balance


class AccountDao:                           # DataAccessObject (abstraction: find + list only, as in DAO<T>)
    def find_by_id(self, id):
        raise NotImplementedError

    def get_all(self):
        raise NotImplementedError


class InMemoryAccountDao(AccountDao):       # ConcreteDAO (save exists only on the concrete class)
    def __init__(self):
        self._rows, self._next = {}, 1

    def find_by_id(self, id):
        if id not in self._rows:
            raise NotFound(id)
        return self._rows[id]

    def save(self, balance):
        account = Account(self._next, balance)
        self._rows[account.id] = account
        self._next += 1
        return account.id

    def get_all(self):
        return list(self._rows.values())


class AccountService:                       # BusinessObject: never touches storage directly
    def __init__(self, dao):
        self.dao = dao

    def open(self, balance):
        return self.dao.save(balance)

    def balance_of(self, id):
        return self.dao.find_by_id(id).balance

    def balances(self):
        return [a.balance for a in self.dao.get_all()]
