class Response:
    def __init__(self, status, message):
        self.status, self.message = status, message


class AccountController:                        # GRASP Controller: receives the system event, no business rules
    def __init__(self, service):
        self.service = service                  # Delegate (any object offering create/deposit/withdraw/list_all)

    def create(self, user_id, kind, balance):
        self.service.create(user_id, kind, balance)
        return Response(201, "Account created")

    def deposit(self, account_id, amount):
        self.service.deposit(account_id, amount)
        return Response(200, "Deposit done")

    def withdraw(self, account_id, amount):
        self.service.withdraw(account_id, amount)
        return Response(200, "Withdraw done")

    def list(self):
        return Response(200, str(len(self.service.list_all())))
