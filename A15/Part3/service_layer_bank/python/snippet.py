class NoUser(Exception):
    pass


class NotFound(Exception):
    pass


class UserRepo:                                # Collaborator
    def __init__(self):
        self.ids = set()

    def add(self, id):
        self.ids.add(id)

    def require(self, id):
        if id not in self.ids:
            raise NoUser(id)


class AccountRepo:                             # Collaborator
    def __init__(self):
        self.rows = []

    def save(self, user_id, balance):
        self.rows.append((user_id, balance))
        return len(self.rows)

    def get(self, id):
        if not 1 <= id <= len(self.rows):
            raise NotFound(id)
        return self.rows[id - 1][1]


class BankService:                             # ServiceLayer: one boundary that coordinates the use cases
    def __init__(self, users, accounts):
        self.users, self.accounts = users, accounts

    def create_user(self, id):
        self.users.add(id)

    def open_account(self, user_id, balance):
        self.users.require(user_id)            # use case: look up the owner first,
        return self.accounts.save(user_id, balance)   # then store the account

    def balance(self, account_id):
        return self.accounts.get(account_id)
